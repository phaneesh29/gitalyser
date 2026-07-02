import type { Context } from 'hono';
import { GithubError } from '../services/github.js';

export const STALE_TTL_MS = 24 * 60 * 60 * 1000;

export function handleError(c: Context, err: unknown) {
  if (err instanceof GithubError) {
    return c.json({ error: err.message }, err.status as 400);
  }
  throw err;
}

export function isStale(fetchedAt: Date): boolean {
  return Date.now() - new Date(fetchedAt).getTime() > STALE_TTL_MS;
}
