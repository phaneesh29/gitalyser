import { SERVER_URL } from "./auth-client";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Thin wrapper around fetch: prefixes the API server, rides cookies, and turns
// non-2xx responses into a typed ApiError carrying the server's { error } body.
export async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "content-type": "application/json", ...(opts.headers ?? {}) },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && String((body as { error: unknown }).error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

// ── Shared types (mirror server/src/services/github.ts + controller) ─────────
export type AnalysisType = "lite_speed" | "deep_mode";

export type WorkspaceSummary = {
  id: string;
  gitRepo: string;
  analysisType: AnalysisType;
  createdAt: string;
  fetchedAt: string;
  isStale: boolean;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
  activityStatus: string | null;
};

export type WorkspaceListResponse = {
  workspaces: WorkspaceSummary[];
  quotas: Record<AnalysisType, number>;
};

export type LiteContext = {
  meta: {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    homepage: string | null;
    url: string;
    license: string | null;
    defaultBranch: string | null;
    primaryLanguage: string | null;
    topics: string[];
    flags: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    sizeKb: number;
  };
  health: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    closedIssues: number;
    openPRs: number;
    closedPRs: number;
  };
  languages: Record<string, number>;
  activity: {
    commitCount: number;
    recentCommits: {
      sha: string;
      message: string;
      date: string;
      author: string;
      additions: number;
      deletions: number;
    }[];
    contributors: { login: string; commits: number }[];
    lastRelease: { tagName: string; name: string | null; publishedAt: string } | null;
    openIssueTitles: { number: number; title: string }[];
    openPRTitles: { number: number; title: string }[];
  };
  structure: {
    treeTruncated: boolean;
    entryCount: number;
    entries: { path: string; type: string }[];
    keyFiles: { hasTests: boolean; hasCI: boolean; dockerized: boolean };
  };
  manifests: Record<string, string>;
  readme: string | null;
  derived: {
    activityStatus: string;
    busFactor: number;
    projectType: string;
    stackSummary: string;
  };
  headSha: string | null;
  fetchedAt: string;
};

export type Analysis = {
  id: string;
  userId: string;
  gitRepo: string;
  analysisType: AnalysisType;
  context: LiteContext;
  createdAt: string;
  fetchedAt: string;
  isStale: boolean;
};

// Compact relative-time label, e.g. "3h ago", "just now".
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
