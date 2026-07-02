import { createFactory } from 'hono/factory';
import { getClientIP } from '../utils/ip.js';

const factory = createFactory();

export const getHealth = factory.createHandlers((c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ip: getClientIP(c),
  });
});
