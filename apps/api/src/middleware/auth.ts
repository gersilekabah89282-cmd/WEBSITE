import { type RequestHandler } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware that requires a valid JWT access token.
 * Sets req.user with the decoded payload.
 */
export const requireAuth: RequestHandler = (req: AuthedRequest, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    req.user = payload;
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

/**
 * Optional auth — sets req.user if token is present, but doesn't fail.
 */
export const optionalAuth: RequestHandler = (req: AuthedRequest, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload.type === 'access') {
        req.user = payload;
      }
    } catch {
      // Ignore invalid token in optional mode
    }
  }
  next();
};
