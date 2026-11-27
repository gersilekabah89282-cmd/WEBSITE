import { Router } from 'express';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const checks = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);

  const db = checks[0].status === 'fulfilled' ? 'ok' : 'down';
  const cache = checks[1].status === 'fulfilled' ? 'ok' : 'down';

  const healthy = db === 'ok' && cache === 'ok';
  res.status(healthy ? 200 : 503).json({
    ok: healthy,
    status: healthy ? 'healthy' : 'degraded',
    service: 'san-story-api',
    timestamp: new Date().toISOString(),
    checks: { database: db, redis: cache },
  });
});

healthRouter.get('/live', (_req, res) => {
  res.json({ ok: true, status: 'alive' });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: 'ready' });
  } catch {
    res.status(503).json({ ok: false, status: 'not_ready' });
  }
});
