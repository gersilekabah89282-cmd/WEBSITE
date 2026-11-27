import express, { type Application, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { requestId } from './middleware/requestId';
import { rateLimiter } from './middleware/rateLimit';
import { auditLogger } from './middleware/audit';

import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { videoRouter } from './modules/video/video.routes';

export function createApp(): Application {
  const app = express();

  // Trust proxy (for X-Forwarded-* headers behind ALB/Cloudflare)
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }));
  app.use(cors({
    origin: env.APP_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Api-Key'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
  app.use(compression());

  // Body parsing
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Request ID + logging
  app.use(requestId);
  app.use(morgan('tiny', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));

  // Rate limiting
  app.use(rateLimiter);

  // Audit logging (after rate limit, before routes)
  app.use(auditLogger);

  // Health check (no auth)
  app.use('/health', healthRouter);

  // API v1 routes
  const v1 = express.Router();
  v1.use('/auth', authRouter);
  v1.use('/videos', videoRouter);
  app.use('/api/v1', v1);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Not Found', path: req.path });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
