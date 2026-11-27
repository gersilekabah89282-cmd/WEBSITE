import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  SHADOW_DATABASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default('san_story_refresh'),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),

  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // TTS / STT
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().default('southeastasia'),
  ELEVENLABS_API_KEY: z.string().optional(),

  // Storage
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_BUCKET: z.string().default('san-story-media'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('ap-southeast-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // App URLs
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),

  // Rate limiting
  RATE_LIMIT_PER_IP_PER_MIN: z.coerce.number().default(100),
  RATE_LIMIT_PER_USER_PER_MIN: z.coerce.number().default(1000),
  RATE_LIMIT_PER_API_KEY_PER_MIN: z.coerce.number().default(60),

  // Upload
  MAX_UPLOAD_SIZE_BYTES: z.coerce.number().default(2147483648),
  CHUNK_SIZE_BYTES: z.coerce.number().default(8388608),

  // FFmpeg
  FFMPEG_PATH: z.string().default('/usr/bin/ffmpeg'),
  FFPROBE_PATH: z.string().default('/usr/bin/ffprobe'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
