import { Hono } from 'hono';
import healthRoute from './health.js';
import { auth } from '../config/auth.js';

const api = new Hono();

api.route('/health', healthRoute);
api.all('/auth/*', (c) => auth.handler(c.req.raw));

export default api;
