import { type Request, type Response, type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { env } from '../../config/env';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';
import { register, login, refresh, getProfile } from './auth.service';
import { requireAuth } from '../../middleware/auth';

export const authRouter: Router = ExpressRouter();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { body } = registerSchema.parse({ body: req.body });
  const result = await register(body);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({
    ok: true,
    user: result.user,
    accessToken: result.accessToken,
  });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await login(body);
  setRefreshCookie(res, result.refreshToken);
  res.json({
    ok: true,
    user: result.user,
    accessToken: result.accessToken,
  });
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const { body } = refreshSchema.parse({ body: req.body });
  const refreshToken = body.refreshToken || req.cookies[env.REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).json({ ok: false, error: 'Missing refresh token' });
  }
  const result = await refresh(refreshToken);
  setRefreshCookie(res, result.refreshToken);
  res.json({
    ok: true,
    user: result.user,
    accessToken: result.accessToken,
  });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const profile = await getProfile(userId);
  res.json({ ok: true, user: profile });
});

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
}
