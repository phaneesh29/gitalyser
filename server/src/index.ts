import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';

import { env } from './config/env.js';
import apiRoutes from './routes/index.js';

const app = new Hono();

app.use('*', requestId());
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', compress());
app.use('*', cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

app.route('/api', apiRoutes);


app.onError((err, c) => {

  const reqId = c.get('requestId');
  
  if (err instanceof HTTPException) {
    console.warn(`⚠️ [HTTPException] Request ID: ${reqId} - Status: ${err.status} - Message: ${err.message}`);
    return err.getResponse();
  }

  console.error(`❌ [Internal Error] Request ID: ${reqId} - ${err.message}`);
  
  return c.json(
    {
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'development' ? err.message : undefined,
      requestId: reqId,
    },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;
