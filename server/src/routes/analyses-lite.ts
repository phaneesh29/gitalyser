import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createAnalysisSchema, idParamSchema } from '../schemas/analysis.schema.js';
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

liteRoute.post('/', zValidator('json', createAnalysisSchema), ...createAnalysis);
liteRoute.get('/', ...listAnalyses);
liteRoute.get('/:id', zValidator('param', idParamSchema), ...getAnalysis);
liteRoute.post('/:id/refresh', zValidator('param', idParamSchema), ...refreshAnalysis);
liteRoute.delete('/:id', zValidator('param', idParamSchema), ...deleteAnalysis);

export default liteRoute;
