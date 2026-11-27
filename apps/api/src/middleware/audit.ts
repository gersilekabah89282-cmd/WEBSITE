import { type RequestHandler } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Audit logger — records mutating operations to the AuditLog table.
 * Runs after the route handler, so it can capture the response status.
 */
export const auditLogger: RequestHandler = (req, res, next) => {
  // Only audit mutating requests
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!mutating) return next();

  // Skip health checks and auth login (audited separately)
  if (req.path.startsWith('/health')) return next();

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const user = (req as any).user;
    const status = res.statusCode;

    // Only log successful mutations (2xx)
    if (status < 200 || status >= 300) return;

    const action = mapMethodToAction(req.method);
    if (!action) return;

    prisma.auditLog
      .create({
        data: {
          actorId: user?.id || null,
          teamId: user?.teamId || null,
          projectId: null,
          action,
          resourceType: req.path.split('/')[3] || 'unknown',
          resourceId: req.params.id || req.path,
          before: null,
          after: { method: req.method, path: req.path, status, duration },
          ip: req.ip,
          userAgent: req.headers['user-agent']?.substring(0, 512),
        },
      })
      .catch((err) => logger.error({ err }, 'Failed to write audit log'));
  });

  next();
};

function mapMethodToAction(method: string): string | null {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return null;
  }
}
