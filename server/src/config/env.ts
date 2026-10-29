import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().default('swasthya_setu_default_secret_key_change_in_prod'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/swasthya_setu'),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().default(3000),
  STUN_URL: z.string().default('stun:stun.l.google.com:19302'),
  TURN_URL: z.string().default(''),
  TURN_USERNAME: z.string().default(''),
  TURN_CREDENTIAL: z.string().default(''),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Warning: Environment variable parsing had issues, falling back to defaults:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  SESSION_SECRET: process.env.SESSION_SECRET || 'swasthya_setu_default_secret_key_change_in_prod',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthya_setu',
  DB_POOL_MAX: 10,
  DB_IDLE_TIMEOUT_MS: 30000,
  DB_CONNECTION_TIMEOUT_MS: 3000,
  STUN_URL: process.env.STUN_URL || 'stun:stun.l.google.com:19302',
  TURN_URL: process.env.TURN_URL || '',
  TURN_USERNAME: process.env.TURN_USERNAME || '',
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
