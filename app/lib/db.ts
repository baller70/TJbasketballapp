
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
    },
  },
});

if (process.env.NODE_ENV === 'development') {
  logger.info('Database connection initialized', {
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? '[REDACTED]' : 'Not configured'
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
