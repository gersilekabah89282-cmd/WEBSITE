import { z } from 'zod';

export const createVideoSchema = z.object({
  body: z.object({
    projectId: z.string().cuid(),
    title: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    originalName: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(100),
    sizeBytes: z.number().int().positive(),
  }),
});

export const finalizeUploadSchema = z.object({
  body: z.object({
    originalUrl: z.string().url(),
    durationSec: z.number().positive().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    fps: z.number().positive().optional(),
    codec: z.string().optional(),
    bitrate: z.number().int().positive().optional(),
  }),
});

export const listVideosSchema = z.object({
  query: z.object({
    projectId: z.string().cuid().optional(),
    status: z.enum(['PENDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>['body'];
export type FinalizeUploadInput = z.infer<typeof finalizeUploadSchema>['body'];
