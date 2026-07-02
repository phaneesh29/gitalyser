import { Hono } from 'hono';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import {
  createAnalysis,
  listAnalyses,
  getAnalysis,
  refreshAnalysis,
  deleteAnalysis,
} from '../controllers/analyses.controller.js';

const analysesRoute = new Hono<AuthEnv>();

analysesRoute.use('*', requireAuth);

analysesRoute.post('/', ...createAnalysis);
analysesRoute.get('/', ...listAnalyses);
analysesRoute.get('/:id', ...getAnalysis);
analysesRoute.post('/:id/refresh', ...refreshAnalysis);
analysesRoute.delete('/:id', ...deleteAnalysis);

export default analysesRoute;
