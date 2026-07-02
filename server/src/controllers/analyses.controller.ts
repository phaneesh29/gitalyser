import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Context } from 'hono';

import { db } from '../db/index.js';
import { analysis } from '../db/schema.js';
import type { AuthEnv } from '../middleware/auth.js';
import {
  parseRepoInput,
  getUserGithubToken,
  fetchLiteContext,
  GithubError,
} from '../services/github.js';

const factory = createFactory<AuthEnv>();

export const STALE_TTL_MS = 24 * 60 * 60 * 1000;

const QUOTAS: Record<string, number> = {
  lite_speed: 5,
  deep_mode: 3,
};

const createSchema = z.object({
  input: z.string().min(1),
  analysisType: z.enum(['lite_speed', 'deep_mode']).default('lite_speed'),
});


function handleError(c: Context, err: unknown) {
  if (err instanceof GithubError) {
    return c.json({ error: err.message }, err.status as 400);
  }
  throw err;
}

function isStale(fetchedAt: Date): boolean {
  return Date.now() - new Date(fetchedAt).getTime() > STALE_TTL_MS;
}

export const createAnalysis = factory.createHandlers(
  zValidator('json', createSchema),
  async (c) => {
    const user = c.get('user');
    const { input, analysisType } = c.req.valid('json');

    if (analysisType === 'deep_mode') {
      return c.json({ error: 'Deep Research mode is coming soon.' }, 501);
    }

    try {
      const { owner, repo } = parseRepoInput(input);
      const gitRepo = `${owner}/${repo}`;

      const [{ value: existingCount }] = await db
        .select({ value: count() })
        .from(analysis)
        .where(and(eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)));

      if (existingCount >= (QUOTAS[analysisType] ?? 0)) {
        return c.json(
          { error: `You've reached the limit of ${QUOTAS[analysisType]} ${analysisType} workspaces. Delete one to free a slot.` },
          403,
        );
      }

      const [dupe] = await db
        .select({ id: analysis.id })
        .from(analysis)
        .where(
          and(
            eq(analysis.userId, user.id),
            eq(analysis.gitRepo, gitRepo),
            eq(analysis.analysisType, analysisType),
          ),
        )
        .limit(1);

      if (dupe) {
        return c.json({ error: 'You already have a workspace for this repository.', id: dupe.id }, 409);
      }

      const token = await getUserGithubToken(user.id);
      const context = await fetchLiteContext(owner, repo, token);

      const [row] = await db
        .insert(analysis)
        .values({
          id: randomUUID(),
          userId: user.id,
          gitRepo,
          analysisType,
          context,
        })
        .returning();

      return c.json({ ...row, isStale: false }, 201);
    } catch (err) {
      return handleError(c, err);
    }
  },
);

export const listAnalyses = factory.createHandlers(async (c) => {
  const user = c.get('user');

  const rows = await db
    .select({
      id: analysis.id,
      gitRepo: analysis.gitRepo,
      analysisType: analysis.analysisType,
      createdAt: analysis.createdAt,
      fetchedAt: analysis.fetchedAt,
      meta: sql<Record<string, any>>`${analysis.context}->'meta'`,
      health: sql<Record<string, any>>`${analysis.context}->'health'`,
      derived: sql<Record<string, any>>`${analysis.context}->'derived'`,
    })
    .from(analysis)
    .where(eq(analysis.userId, user.id))
    .orderBy(desc(analysis.createdAt));

  const workspaces = rows.map((r) => ({
    id: r.id,
    gitRepo: r.gitRepo,
    analysisType: r.analysisType,
    createdAt: r.createdAt,
    fetchedAt: r.fetchedAt,
    isStale: isStale(r.fetchedAt),
    description: r.meta?.description ?? null,
    primaryLanguage: r.meta?.primaryLanguage ?? null,
    stars: r.health?.stars ?? 0,
    activityStatus: r.derived?.activityStatus ?? null,
  }));

  return c.json({ workspaces, quotas: QUOTAS });
});


export const getAnalysis = factory.createHandlers(async (c) => {
  const user = c.get('user');
  const id = c.req.param('id')!;

  const [row] = await db
    .select()
    .from(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, user.id)))
    .limit(1);

  if (!row) return c.json({ error: 'Workspace not found.' }, 404);

  return c.json({ ...row, isStale: isStale(row.fetchedAt) });
});


export const refreshAnalysis = factory.createHandlers(async (c) => {
  const user = c.get('user');
  const id = c.req.param('id')!;

  const [row] = await db
    .select({ id: analysis.id, gitRepo: analysis.gitRepo })
    .from(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, user.id)))
    .limit(1);

  if (!row) return c.json({ error: 'Workspace not found.' }, 404);

  try {
    const { owner, repo } = parseRepoInput(row.gitRepo);
    const token = await getUserGithubToken(user.id);
    const context = await fetchLiteContext(owner, repo, token);

    const [updated] = await db
      .update(analysis)
      .set({ context, fetchedAt: new Date() })
      .where(eq(analysis.id, id))
      .returning();

    return c.json({ ...updated, isStale: false });
  } catch (err) {
    return handleError(c, err);
  }
});


export const deleteAnalysis = factory.createHandlers(async (c) => {
  const user = c.get('user');
  const id = c.req.param('id')!;

  const deleted = await db
    .delete(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, user.id)))
    .returning({ id: analysis.id });

  if (deleted.length === 0) return c.json({ error: 'Workspace not found.' }, 404);

  return c.json({ success: true });
});
