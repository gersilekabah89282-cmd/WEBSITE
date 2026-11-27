import { type RequestHandler, type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id || 'unknown';

  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
      requestId,
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, 'AppError');
    }
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      code: err.code,
      details: err.details,
      requestId,
    });
  }

  // Unknown errors
  logger.error({ err, requestId }, 'Unhandled error');
  return res.status(500).json({
    ok: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId,
  });
};
