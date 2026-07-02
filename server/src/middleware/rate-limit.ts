import { Ratelimit } from '@upstash/ratelimit';
import { createMiddleware } from 'hono/factory';
import { getClientIP } from '../utils/ip.js';
import { redis } from '../config/redis.js';


const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  ephemeralCache: new Map(),
  analytics: true,
});
export const rateLimiter = createMiddleware(async (c, next) => {
  const ip = getClientIP(c);

  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  c.header('X-RateLimit-Limit', limit.toString());
  c.header('X-RateLimit-Remaining', remaining.toString());
  c.header('X-RateLimit-Reset', reset.toString());

  if (!success) {
    return c.json({ 
      error: 'Too many requests', 
      message: 'You have exceeded the rate limit. Please try again later.' 
    }, 429);
  }

  await next();
});
