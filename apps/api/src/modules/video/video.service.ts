import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { CreateVideoInput, FinalizeUploadInput } from './video.schema';

export interface VideoWithRelations {
  id: string;
  projectId: string;
  uploaderId: string;
  title: string;
  description: string | null;
  originalUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: bigint;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  thumbnailUrl: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createVideo(
  userId: string,
  teamId: string,
  input: CreateVideoInput,
): Promise<{ id: string; uploadUrl: string }> {
  // Verify project belongs to user's team
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, teamId },
  });
  if (!project) {
    throw new NotFoundError('Project');
  }

  if (input.sizeBytes > env.MAX_UPLOAD_SIZE_BYTES) {
    throw new ValidationError(`File size exceeds maximum of ${env.MAX_UPLOAD_SIZE_BYTES} bytes`);
  }

  const video = await prisma.video.create({
    data: {
      projectId: input.projectId,
      uploaderId: userId,
      title: input.title,
      description: input.description,
      originalUrl: '', // Will be set after upload completes
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      durationSec: 0,
      width: 0,
      height: 0,
      fps: 0,
      codec: '',
      bitrate: 0,
      status: 'PENDING',
    },
  });

  // Generate presigned URL for direct-to-storage upload
  // In Phase 1, we return a mock URL; actual S3/Supabase integration in Phase 2
  const uploadUrl = `${env.API_URL}/api/v1/videos/${video.id}/upload`;

  logger.info({ videoId: video.id, userId, projectId: input.projectId }, 'Video created');

  return { id: video.id, uploadUrl };
}

export async function finalizeUpload(
  videoId: string,
  userId: string,
  teamId: string,
  input: FinalizeUploadInput,
): Promise<VideoWithRelations> {
  const video = await prisma.video.findFirst({
    where: { id: videoId, uploaderId: userId },
    include: { project: true },
  });
  if (!video) {
    throw new NotFoundError('Video');
  }
  if (video.project.teamId !== teamId) {
    throw new ForbiddenError('Access denied to this video');
  }

  const updated = await prisma.video.update({
    where: { id: videoId },
    data: {
      originalUrl: input.originalUrl,
      durationSec: input.durationSec ?? 0,
      width: input.width ?? 0,
      height: input.height ?? 0,
      fps: input.fps ?? 0,
      codec: input.codec ?? '',
      bitrate: input.bitrate ?? 0,
      status: 'PROCESSING', // Will be picked up by worker for probe/transcode
    },
  });

  // Enqueue video processing job (Phase 2 will implement the worker)
  // For now, we just mark it as READY after metadata is set
  if (input.durationSec && input.width && input.height) {
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'READY' },
    });
  }

  logger.info({ videoId, userId }, 'Video upload finalized');

  return updated as VideoWithRelations;
}

export async function getVideo(
  videoId: string,
  userId: string,
  _teamId: string,
): Promise<VideoWithRelations> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { project: { include: { team: { include: { members: true } } } } },
  });
  if (!video) {
    throw new NotFoundError('Video');
  }

  // Check if user has access
  const isMember = video.project.team.members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new ForbiddenError('Access denied to this video');
  }

  return video as VideoWithRelations;
}

export async function listVideos(
  userId: string,
  teamId: string,
  opts: { projectId?: string; status?: string; page: number; limit: number },
): Promise<{ items: VideoWithRelations[]; total: number; page: number; limit: number }> {
  const where = {
    project: { teamId },
    ...(opts.projectId ? { projectId: opts.projectId } : {}),
    ...(opts.status ? { status: opts.status as any } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    }),
    prisma.video.count({ where }),
  ]);

  return {
    items: items as VideoWithRelations[],
    total,
    page: opts.page,
    limit: opts.limit,
  };
}

export async function deleteVideo(
  videoId: string,
  userId: string,
  _teamId: string,
): Promise<void> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { project: { include: { team: { include: { members: true } } } } },
  });
  if (!video) {
    throw new NotFoundError('Video');
  }

  const isOwner = video.uploaderId === userId;
  const isAdmin = video.project.team.members.some(
    (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
  );
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Only the uploader or admin can delete this video');
  }

  await prisma.video.delete({ where: { id: videoId } });
  logger.info({ videoId, userId }, 'Video deleted');
}
