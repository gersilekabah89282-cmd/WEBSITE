import { logger } from './utils/logger';
import './processors/video.processor';

logger.info('🚀 SAN STORY Worker started');
logger.info('   Consuming queues: video');

// Health check endpoint for worker (optional, for k8s liveness)
import http from 'http';
import { env } from './config/env';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, status: 'healthy', service: 'san-story-worker' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4001, () => {
  logger.info(`   Worker health check on http://localhost:${env.PORT + 1}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`[${signal}] worker shutting down...`);
  server.close();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
