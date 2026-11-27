import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { signToken, verifyToken, type JwtPayload } from '../../utils/jwt';
import { hashPassword, verifyPassword, generateToken } from '../../utils/hash';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { RegisterInput, LoginInput } from './auth.schema';

export interface AuthResult {
  user: { id: string; email: string; name: string; avatarUrl: string | null };
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name, locale } = input;
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { emailLower },
  });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      emailLower,
      passwordHash,
      name,
      locale,
    },
  });

  // Create personal team for the user
  const team = await prisma.team.create({
    data: {
      name: `${name}'s Team`,
      slug: `${user.id.substring(0, 8)}-team`,
      ownerId: user.id,
      plan: 'FREE',
      seatsUsed: 1,
      seatsLimit: 1,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  const tokens = await issueTokens(user.id, user.email, team.id, 'OWNER');

  logger.info({ userId: user.id, teamId: team.id }, 'User registered');

  return {
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    ...tokens,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;
  const emailLower = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { emailLower },
    include: {
      teamMemberships: { include: { team: true }, take: 1 },
    },
  });
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.twoFactorEnabled) {
    // Return partial result indicating 2FA required
    throw new UnauthorizedError('2FA required');
  }

  const team = user.teamMemberships[0]?.team;
  if (!team) {
    throw new NotFoundError('Team not found for user');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await issueTokens(user.id, user.email, team.id, user.teamMemberships[0].role);

  return {
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    ...tokens,
  };
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload: JwtPayload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new UnauthorizedError('Invalid token type');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { teamMemberships: { include: { team: true }, take: 1 } },
  });
  if (!user) {
    throw new NotFoundError('User');
  }

  const team = user.teamMemberships[0]?.team;
  if (!team || team.id !== payload.teamId) {
    throw new UnauthorizedError('Team mismatch');
  }

  const tokens = await issueTokens(user.id, user.email, team.id, user.teamMemberships[0].role);

  return {
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    ...tokens,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      locale: true,
      timezone: true,
      twoFactorEnabled: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const emailLower = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { emailLower } });
  if (!user) {
    // Don't leak whether email exists
    return;
  }

  const token = generateToken(32);
  // Store in Redis with 1 hour TTL
  // In production, send email with reset link
  logger.info({ userId: user.id }, 'Password reset requested');
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Verify token from Redis (implementation omitted for brevity)
  // Update user password
  throw new ValidationError('Not implemented in Phase 1');
}

async function issueTokens(
  userId: string,
  email: string,
  teamId: string,
  role: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signToken({ sub: userId, email, teamId, role }, 'access');
  const refreshToken = signToken({ sub: userId, email, teamId, role }, 'refresh');

  // Persist session in Redis for revocation tracking
  // (omitted for brevity; would store session ID → userId mapping)

  return { accessToken, refreshToken };
}
