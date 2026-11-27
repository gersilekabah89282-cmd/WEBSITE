import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    name: z.string().min(1).max(120),
    locale: z.string().max(10).optional().default('en'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

export const setup2faSchema = z.object({
  body: z.object({
    code: z.string().length(6),
  }),
});

export const verify2faSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    code: z.string().length(6),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
