// Танзимоти муҳит (environment variables) бо validation
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Санҷиши мавҷудияти вариантҳои ҳатмӣ
if (!env.JWT_SECRET) {
  throw new Error('JWT_SECCTET not defined in environment variables');
}
