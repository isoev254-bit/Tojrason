// config/env.ts - Танзимоти муҳит бо валидатсия
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Node
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Payment (Stripe)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Санҷиши вариантҳои ҳатмӣ
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const;
for (const key of requiredEnv) {
  if (!env[key]) {
    throw new Error(`${key} is not defined in environment variables`);
  }
}
