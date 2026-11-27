import { type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const rateLimiter: RequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    // Authenticated users get higher limits
    return (req as any).user ? env.RATE_LIMIT_PER_USER_PER_MIN : env.RATE_LIMIT_PER_IP_PER_MIN;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
  handler: (_req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});
