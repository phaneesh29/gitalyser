import { createFactory } from 'hono/factory';

const factory = createFactory();

export const getHealth = factory.createHandlers((c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
