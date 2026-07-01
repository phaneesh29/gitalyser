import { Hono } from 'hono';
import { getHealth } from '../controllers/health.controller.js';

const healthRoute = new Hono();

healthRoute.get('/', ...getHealth);

export default healthRoute;
