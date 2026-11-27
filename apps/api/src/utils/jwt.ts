import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;        // user ID
  email: string;
  teamId?: string;
  role?: string;
  type: 'access' | 'refresh' | 'api';
}

export function signToken(payload: Omit<JwtPayload, 'type'>, type: JwtPayload['type'] = 'access', expiresIn?: string): string {
  const secret = env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: expiresIn ?? (type === 'refresh' ? env.REFRESH_TOKEN_EXPIRES_IN : env.JWT_EXPIRES_IN),
  };
  return jwt.sign({ ...payload, type }, secret, options);
}

export function verifyToken(token: string, options?: VerifyOptions): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, options) as JwtPayload;
  return decoded;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
