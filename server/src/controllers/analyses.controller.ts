import { createFactory, createMiddleware } from 'hono/factory';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Context } from 'hono';

import { db } from '../db/index.js';
import { analysis } from '../db/schema.js';
import type { SessionUser } from '../middleware/auth.js';
import {
  parseRepoInput,
  getUserGithubToken,
  fetchLiteContext,
} from '../services/github.js';
import { handleError, isStale } from '../helpers/analyses.helper.js';

type AnalysisType = 'lite_speed' | 'deep_research';


export type AnalysisEnv = {
  Variables: {
    user: SessionUser;
    analysisType: AnalysisType;
  };
};

const factory = createFactory<AnalysisEnv>();

const QUOTAS: Record<AnalysisType, number> = {
  lite_speed: 5,
  deep_research: 3,
};


export function withAnalysisType(type: AnalysisType) {
  return createMiddleware<AnalysisEnv>(async (c, next) => {
    c.set('analysisType', type);
    await next();
  });
}

export const createAnalysis = factory.createHandlers(
  async (c) => {
    const user = c.get('user');
    const analysisType = c.get('analysisType');
    const { input } = c.req.valid('json' as never) as { input: string };

    try {
      const { owner, repo } = parseRepoInput(input);
      const gitRepo = `${owner}/${repo}`;


      const [{ value: existingCount }] = await db
        .select({ value: count() })
        .from(analysis)
        .where(and(eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)));

      if (existingCount >= QUOTAS[analysisType]) {
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
  const analysisType = c.get('analysisType');

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
    .where(and(eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)))
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

  return c.json({ workspaces, quota: QUOTAS[analysisType] });
});

export const getAnalysis = factory.createHandlers(
  async (c) => {
  const user = c.get('user');
  const analysisType = c.get('analysisType');
  const { id } = c.req.valid('param' as never) as { id: string };

  const [row] = await db
    .select()
    .from(analysis)
    .where(
      and(eq(analysis.id, id), eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)),
    )
    .limit(1);

  if (!row) return c.json({ error: 'Workspace not found.' }, 404);

  return c.json({ ...row, isStale: isStale(row.fetchedAt) });
});


export const refreshAnalysis = factory.createHandlers(
  async (c) => {
  const user = c.get('user');
  const analysisType = c.get('analysisType');
  const { id } = c.req.valid('param' as never) as { id: string };

  const [row] = await db
    .select({ id: analysis.id, gitRepo: analysis.gitRepo })
    .from(analysis)
    .where(
      and(eq(analysis.id, id), eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)),
    )
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

export const deleteAnalysis = factory.createHandlers(
  async (c) => {
  const user = c.get('user');
  const analysisType = c.get('analysisType');
  const { id } = c.req.valid('param' as never) as { id: string };

  const deleted = await db
    .delete(analysis)
    .where(
      and(eq(analysis.id, id), eq(analysis.userId, user.id), eq(analysis.analysisType, analysisType)),
    )
    .returning({ id: analysis.id });

  if (deleted.length === 0) return c.json({ error: 'Workspace not found.' }, 404);

  return c.json({ success: true });
});
