// config/db.ts - Singleton Prisma Client
import { PrismaClient } from '@prisma/client';
import logger from './logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Функсияи бастани пайваст (барои graceful shutdown)
export const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

export default prisma;
