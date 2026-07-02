import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import {
  withAnalysisType,
  createAnalysis,
  listAnalyses,
  getAnalysis,
  refreshAnalysis,
  deleteAnalysis,
  type AnalysisEnv,
} from '../controllers/analyses.controller.js';


const liteRoute = new Hono<AnalysisEnv>();

liteRoute.use('*', requireAuth);
liteRoute.use('*', withAnalysisType('lite_speed'));

liteRoute.post('/', ...createAnalysis);
liteRoute.get('/', ...listAnalyses);
liteRoute.get('/:id', ...getAnalysis);
liteRoute.post('/:id/refresh', ...refreshAnalysis);
liteRoute.delete('/:id', ...deleteAnalysis);

export default liteRoute;
