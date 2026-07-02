import { createMiddleware } from 'hono/factory';
import { auth } from '../config/auth.js';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type AuthEnv = {
  Variables: {
    user: SessionUser;
  };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user as SessionUser);
  await next();
});
