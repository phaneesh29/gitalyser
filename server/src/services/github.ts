import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { account } from '../db/schema.js';


const GITHUB_GQL = 'https://api.github.com/graphql';
const GITHUB_REST = 'https://api.github.com';

const MAX_TREE_ENTRIES = 1500;
const MAX_COMMITS = 30;
const MAX_README_BYTES = 8 * 1024;

const MAX_MANIFEST_STORE_BYTES = 4 * 1024;
const MAX_MANIFEST_READ_BYTES = 256 * 1024; // safety guard against absurd blobs


const MANIFEST_FILES = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'go.mod',
  'Cargo.toml',
  'Gemfile',
  'composer.json',
  'pom.xml',
  'build.gradle',
  'Dockerfile',
];


const README_FILES = [
  'README.md',
  'readme.md',
  'Readme.md',
  'README.rst',
  'README.txt',
  'README',
];


export class GithubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'GithubError';
    this.status = status;
  }
}


export type RepoRef = { owner: string; repo: string };

export type LiteContext = {
  meta: Record<string, unknown>;
  health: Record<string, number>;
  languages: Record<string, number>;
  activity: Record<string, unknown>;
  structure: {
    treeTruncated: boolean;
    entryCount: number;
    entries: { path: string; type: string }[];
    keyFiles: { hasTests: boolean; hasCI: boolean; dockerized: boolean };
  };
  manifests: Record<string, string>;
  readme: string | null;
  derived: Record<string, unknown>;
  headSha: string | null;
  fetchedAt: string;
};


const NAME_RE = /^[A-Za-z0-9_.-]+$/;


export function parseRepoInput(input: string): RepoRef {
  if (!input || typeof input !== 'string') {
    throw new GithubError(400, 'Repository is required.');
  }
  const path = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new GithubError(400, 'Invalid repository. Use "owner/repo" or a GitHub URL.');
  }
  const [owner, repo] = parts;
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) {
    throw new GithubError(400, 'Invalid repository name.');
  }
  return { owner, repo };
}


export async function getUserGithubToken(userId: string): Promise<string> {
  const rows = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'github')))
    .limit(1);

  const token = rows[0]?.accessToken;
  if (!token) {
    throw new GithubError(400, 'GitHub account not connected.');
  }
  return token;
}

// ── GraphQL query ───────────────────────────────────────────────────────────
function buildManifestAliases(): { field: string; map: Record<string, string> } {
  const map: Record<string, string> = {};
  const parts = MANIFEST_FILES.map((file, i) => {
    const alias = `m${i}`;
    map[alias] = file;
    return `${alias}: object(expression: "HEAD:${file}") { ... on Blob { text byteSize } }`;
  });
  return { field: parts.join('\n    '), map };
}

function buildReadmeAliases(): { field: string; aliases: string[] } {
  const aliases: string[] = [];
  const parts = README_FILES.map((file, i) => {
    const alias = `r${i}`;
    aliases.push(alias);
    return `${alias}: object(expression: "HEAD:${file}") { ... on Blob { text } }`;
  });
  return { field: parts.join('\n    '), aliases };
}

function buildQuery(): { query: string; manifestMap: Record<string, string>; readmeAliases: string[] } {
  const { field: manifestField, map: manifestMap } = buildManifestAliases();
  const { field: readmeField, aliases: readmeAliases } = buildReadmeAliases();

  const query = `query($owner: String!, $name: String!) {
  rateLimit { cost remaining }
  repository(owner: $owner, name: $name) {
    name
    nameWithOwner
    description
    homepageUrl
    url
    isPrivate isFork isArchived isTemplate isMirror isEmpty
    createdAt updatedAt pushedAt
    diskUsage
    stargazerCount
    forkCount
    watchers { totalCount }
    openIssues: issues(states: OPEN) { totalCount }
    closedIssues: issues(states: CLOSED) { totalCount }
    openPRs: pullRequests(states: OPEN) { totalCount }
    closedPRs: pullRequests(states: [CLOSED, MERGED]) { totalCount }
    licenseInfo { name spdxId }
    primaryLanguage { name }
    repositoryTopics(first: 20) { nodes { topic { name } } }
    languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
      totalSize
      edges { size node { name } }
    }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          oid
          history(first: ${MAX_COMMITS}) {
            totalCount
            nodes {
              oid
              messageHeadline
              committedDate
              additions
              deletions
              author { name user { login } }
            }
          }
        }
      }
    }
    latestRelease: releases(first: 1, orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes { tagName name publishedAt }
    }
    openIssueList: issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes { number title }
    }
    openPRList: pullRequests(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes { number title }
    }
    ${manifestField}
    ${readmeField}
  }
}`;

  return { query, manifestMap, readmeAliases };
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'gitalyser',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function runGraphql(token: string, owner: string, repo: string) {
  const { query, manifestMap, readmeAliases } = buildQuery();

  let res: Response;
  try {
    res = await fetch(GITHUB_GQL, {
      method: 'POST',
      headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { owner, name: repo } }),
    });
  } catch {
    throw new GithubError(502, 'Failed to reach GitHub.');
  }

  if (res.status === 401) {
    throw new GithubError(401, 'GitHub authentication failed. Reconnect your account.');
  }
  if (res.status === 403 || res.status === 429) {
    throw new GithubError(429, 'GitHub API rate limit reached. Please try again later.');
  }
  if (!res.ok) {
    throw new GithubError(502, `GitHub request failed (${res.status}).`);
  }

  const json = (await res.json()) as {
    data?: { repository: Record<string, any> | null };
    errors?: { type?: string; message?: string }[];
  };

  if (json.errors?.length) {
    const notFound = json.errors.some(
      (e) => e.type === 'NOT_FOUND' || /could not resolve to a repository/i.test(e.message ?? ''),
    );
    if (notFound) {
      throw new GithubError(404, 'Repository not found, or it is private and your account lacks access.');
    }
    throw new GithubError(502, json.errors[0]?.message ?? 'GitHub GraphQL error.');
  }

  const repository = json.data?.repository;
  if (!repository) {
    throw new GithubError(404, 'Repository not found.');
  }

  return { repository, manifestMap, readmeAliases };
}

async function fetchTree(token: string, owner: string, repo: string, branch: string) {
  try {
    const res = await fetch(
      `${GITHUB_REST}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: { ...ghHeaders(token), Accept: 'application/vnd.github+json' } },
    );
    if (!res.ok) return { entries: [] as { path: string; type: string }[], truncated: false };

    const json = (await res.json()) as {
      tree?: { path: string; type: string }[];
      truncated?: boolean;
    };
    const all = json.tree ?? [];
    const entries = all
      .slice(0, MAX_TREE_ENTRIES)
      .map((e) => ({ path: e.path, type: e.type }));
    return { entries, truncated: Boolean(json.truncated) || all.length > MAX_TREE_ENTRIES };
  } catch {
    return { entries: [], truncated: false };
  }
}

function toLanguagePercentages(languages: any): Record<string, number> {
  const total = languages?.totalSize ?? 0;
  const out: Record<string, number> = {};
  if (!total || !Array.isArray(languages?.edges)) return out;
  for (const edge of languages.edges) {
    out[edge.node.name] = Math.round((edge.size / total) * 1000) / 10;
  }
  return out;
}

function pickReadme(repository: any, readmeAliases: string[]): string | null {
  for (const alias of readmeAliases) {
    const text: string | undefined = repository[alias]?.text;
    if (text) return text.slice(0, MAX_README_BYTES);
  }
  return null;
}

function readManifests(repository: any, manifestMap: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [alias, file] of Object.entries(manifestMap)) {
    const blob = repository[alias];
    if (blob?.text) out[file] = String(blob.text).slice(0, MAX_MANIFEST_READ_BYTES);
  }
  return out;
}

function truncateManifests(full: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [file, text] of Object.entries(full)) {
    out[file] = text.slice(0, MAX_MANIFEST_STORE_BYTES);
  }
  return out;
}

function summarizeContributors(commits: any[]): { login: string; commits: number }[] {
  const counts = new Map<string, number>();
  for (const c of commits) {
    const login = c.author?.user?.login ?? c.author?.name ?? 'unknown';
    counts.set(login, (counts.get(login) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([login, n]) => ({ login, commits: n }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10);
}

const DAY = 24 * 60 * 60 * 1000;

function activityStatus(pushedAt: string | null, isArchived: boolean): string {
  if (isArchived) return 'archived';
  if (!pushedAt) return 'unknown';
  const age = Date.now() - new Date(pushedAt).getTime();
  if (age <= 30 * DAY) return 'active';
  if (age <= 180 * DAY) return 'maintained';
  if (age <= 365 * DAY) return 'stale';
  return 'abandoned';
}

function busFactor(contributors: { commits: number }[]): number {
  const total = contributors.reduce((s, c) => s + c.commits, 0);
  if (!total) return 0;
  let acc = 0;
  let n = 0;
  for (const c of contributors) {
    acc += c.commits;
    n += 1;
    if (acc / total >= 0.5) break;
  }
  return n;
}

function detectKeyFiles(entries: { path: string; type: string }[], manifests: Record<string, string>) {
  const paths = entries.map((e) => e.path.toLowerCase());
  const hasTests = paths.some(
    (p) => /(^|\/)(tests?|__tests__|spec)(\/|$)/.test(p) || /\.(test|spec)\.[a-z]+$/.test(p),
  );
  const hasCI = paths.some(
    (p) => p.startsWith('.github/workflows/') || p === '.gitlab-ci.yml' || p.startsWith('.circleci/'),
  );
  const dockerized =
    'Dockerfile' in manifests ||
    paths.some((p) => p === 'dockerfile' || p.endsWith('/dockerfile') || p.includes('docker-compose'));
  return { hasTests, hasCI, dockerized };
}

function detectProjectType(
  manifests: Record<string, string>,
  languages: Record<string, number>,
  keyFiles: { dockerized: boolean },
): string {
  const pkgRaw = manifests['package.json'];
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw);
      if (pkg.bin) return 'cli';
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next || deps.react || deps.vue || deps['@angular/core'] || deps.svelte) return 'web-app';
      if (pkg.main || pkg.module || pkg.exports) return 'library';
    } catch {
    }
  }
  if (manifests['pyproject.toml'] || manifests['requirements.txt']) return 'python-project';
  if (manifests['go.mod']) return 'go-module';
  if (manifests['Cargo.toml']) return 'rust-crate';
  const top = Object.keys(languages)[0];
  return top ? `${top.toLowerCase()}-project` : 'unknown';
}

function stackSummary(
  primaryLanguage: string | null,
  languages: Record<string, number>,
  manifests: Record<string, string>,
): string {
  const langs = Object.keys(languages).slice(0, 3);
  const frameworks: string[] = [];
  const pkgRaw = manifests['package.json'];
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw);
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      for (const fw of ['next', 'react', 'vue', 'svelte', 'express', 'hono', 'nestjs', '@angular/core']) {
        if (deps.includes(fw)) frameworks.push(fw.replace('@angular/core', 'angular'));
      }
    } catch {
      /* ignore */
    }
  }
  const parts = [langs.join(', ') || primaryLanguage || 'unknown'];
  if (frameworks.length) parts.push(`(${frameworks.join(', ')})`);
  return parts.join(' ');
}

export async function fetchLiteContext(owner: string, repo: string, token: string): Promise<LiteContext> {
  const { repository, manifestMap, readmeAliases } = await runGraphql(token, owner, repo);

  const branch: string | null = repository.defaultBranchRef?.name ?? null;
  const commit = repository.defaultBranchRef?.target ?? null;
  const commits: any[] = commit?.history?.nodes ?? [];

  const tree = branch ? await fetchTree(token, owner, repo, branch) : { entries: [], truncated: false };

  const languages = toLanguagePercentages(repository.languages);
  const manifestsFull = readManifests(repository, manifestMap); // parse against full text
  const manifests = truncateManifests(manifestsFull); // store truncated
  const contributors = summarizeContributors(commits);
  const keyFiles = detectKeyFiles(tree.entries, manifestsFull);

  const meta = {
    owner,
    name: repository.name,
    fullName: repository.nameWithOwner,
    description: repository.description,
    homepage: repository.homepageUrl || null,
    url: repository.url,
    license: repository.licenseInfo?.spdxId ?? repository.licenseInfo?.name ?? null,
    defaultBranch: branch,
    primaryLanguage: repository.primaryLanguage?.name ?? null,
    topics: (repository.repositoryTopics?.nodes ?? []).map((n: any) => n.topic.name),
    flags: {
      isPrivate: repository.isPrivate,
      isFork: repository.isFork,
      isArchived: repository.isArchived,
      isTemplate: repository.isTemplate,
      isMirror: repository.isMirror,
      isEmpty: repository.isEmpty,
    },
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    pushedAt: repository.pushedAt,
    sizeKb: repository.diskUsage,
  };

  const health = {
    stars: repository.stargazerCount ?? 0,
    forks: repository.forkCount ?? 0,
    watchers: repository.watchers?.totalCount ?? 0,
    openIssues: repository.openIssues?.totalCount ?? 0,
    closedIssues: repository.closedIssues?.totalCount ?? 0,
    openPRs: repository.openPRs?.totalCount ?? 0,
    closedPRs: repository.closedPRs?.totalCount ?? 0,
  };

  const activity = {
    commitCount: commit?.history?.totalCount ?? 0,
    recentCommits: commits.map((c) => ({
      sha: c.oid,
      message: c.messageHeadline,
      date: c.committedDate,
      author: c.author?.user?.login ?? c.author?.name ?? 'unknown',
      additions: c.additions,
      deletions: c.deletions,
    })),
    contributors,
    lastRelease: repository.latestRelease?.nodes?.[0] ?? null,
    openIssueTitles: (repository.openIssueList?.nodes ?? []).map((n: any) => ({ number: n.number, title: n.title })),
    openPRTitles: (repository.openPRList?.nodes ?? []).map((n: any) => ({ number: n.number, title: n.title })),
  };

  const derived = {
    activityStatus: activityStatus(repository.pushedAt, repository.isArchived),
    busFactor: busFactor(contributors),
    projectType: detectProjectType(manifestsFull, languages, keyFiles),
    stackSummary: stackSummary(repository.primaryLanguage?.name ?? null, languages, manifestsFull),
  };

  return {
    meta,
    health,
    languages,
    activity,
    structure: {
      treeTruncated: tree.truncated,
      entryCount: tree.entries.length,
      entries: tree.entries,
      keyFiles,
    },
    manifests,
    readme: pickReadme(repository, readmeAliases),
    derived,
    headSha: commit?.oid ?? null,
    fetchedAt: new Date().toISOString(),
  };
}
