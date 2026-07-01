import { Hono } from 'hono';
import healthRoute from './health.js';

const api = new Hono();

api.route('/health', healthRoute);

export default api;
