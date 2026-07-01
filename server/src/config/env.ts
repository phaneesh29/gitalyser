import "dotenv/config";
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
  CORS_ORIGIN: z.url({ message: 'CORS_ORIGIN must be a valid URL' }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
