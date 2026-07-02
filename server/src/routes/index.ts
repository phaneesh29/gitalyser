import { Hono } from 'hono';
import healthRoute from './health.js';
import { auth } from '../config/auth.js';
import { rateLimiter } from '../middleware/rate-limit.js';

const api = new Hono();

api.use('*', rateLimiter);

api.route('/health', healthRoute);
api.all('/auth/*', (c) => auth.handler(c.req.raw));

export default api;
