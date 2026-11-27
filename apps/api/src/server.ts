import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';

async function bootstrap() {
  const app = createApp();
  const server = createServer(app);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`[${signal}] shutting down gracefully...`);
    server.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled errors
  process.on('unhandledRejection', (err) => {
    logger.error('unhandledRejection:', err);
  });
  process.on('uncaughtException', (err) => {
    logger.error('uncaughtException:', err);
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    logger.info(`🚀 SAN STORY API listening on http://localhost:${env.PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   API URL: ${env.API_URL}/api/v1`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
