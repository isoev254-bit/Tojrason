// config/redis.ts - Пайвастшавӣ ба Redis барои кэш ва queue
import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

const redisUrl = env.REDIS_URL;

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnect attempt ${times}, delay ${delay}ms`);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

// Функсияи пайвастшавӣ (дар server.ts даъват мешавад)
export const connectRedis = async () => {
  await redis.connect();
};

// Функсияи бастан
export const disconnectRedis = async () => {
  await redis.quit();
  logger.info('Redis disconnected');
};
