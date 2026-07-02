import "dotenv/config";
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
  CORS_ORIGIN: z.url({ message: 'CORS_ORIGIN must be a valid URL' }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32, { message: 'BETTER_AUTH_SECRET must be at least 32 characters' }),
  BETTER_AUTH_URL: z.url(),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
