import { Hono } from 'hono';
import liteRoute from './analyses-lite.js';


const analysesRoute = new Hono();

analysesRoute.route('/lite', liteRoute);

export default analysesRoute;
