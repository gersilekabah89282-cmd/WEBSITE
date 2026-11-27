import IORedis, { type Redis } from 'ioredis';
import { env } from './env';

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
  });

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => {
  console.error('[redis] error:', err.message);
});
redis.on('connect', () => {
  console.log('[redis] connected');
});
