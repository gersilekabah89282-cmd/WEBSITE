import { Worker, type Job } from 'bullmq';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const exec = promisify(execCb);

const QUEUE_NAME = 'video';

interface VideoJobData {
  videoId: string;
  type: 'probe' | 'transcode' | 'thumbnail' | 'extract-audio';
}

export const videoProcessor = new Worker(
  QUEUE_NAME,
  async (job: Job<VideoJobData>) => {
    const { videoId, type } = job.data;
    logger.info({ videoId, type, jobId: job.id }, 'Processing video job');

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    switch (type) {
      case 'probe':
        return probeVideo(video.originalUrl, videoId);
      case 'transcode':
        return transcodeVideo(video.originalUrl, videoId);
      case 'thumbnail':
        return generateThumbnails(video.originalUrl, videoId);
      case 'extract-audio':
        return extractAudio(video.originalUrl, videoId);
      default:
        throw new Error(`Unknown video job type: ${type}`);
    }
  },
  {
    connection: redis,
    concurrency: env.FFMPEG_THREADS || 2,
  },
);

async function probeVideo(url: string, videoId: string): Promise<Record<string, unknown>> {
  await prisma.video.update({
    where: { id: videoId },
    data: { status: 'PROCESSING' },
  });

  try {
    const { stdout } = await exec(
      `${env.FFPROBE_PATH} -v quiet -print_format json -show_format -show_streams "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 },
    );
    const metadata = JSON.parse(stdout);

    const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video');
    const audioStream = metadata.streams?.find((s: any) => s.codec_type === 'audio');

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        durationSec: parseFloat(metadata.format?.duration || '0'),
        width: parseInt(videoStream?.width || '0', 10),
        height: parseInt(videoStream?.height || '0', 10),
        fps: parseFps(videoStream?.r_frame_rate),
        codec: videoStream?.codec_name || '',
        bitrate: parseInt(metadata.format?.bit_rate || '0', 10),
        status: 'READY',
        metadata: metadata,
      },
    });

    logger.info({ videoId, durationSec: updated.durationSec }, 'Video probe complete');
    return { durationSec: updated.durationSec, width: updated.width, height: updated.height };
  } catch (err: any) {
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED', errorMessage: err.message },
    });
    throw err;
  }
}

async function transcodeVideo(url: string, videoId: string): Promise<{ outputUrl: string }> {
  const outputUrl = `s3://${env.S3_BUCKET || 'san-story-media'}/transcoded/${videoId}.mp4`;
  const outputPath = `/tmp/${videoId}.mp4`;

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(env.FFMPEG_PATH, [
      '-i', url,
      '-c:v', 'libx264',
      '-preset', env.FFMPEG_PRESET || 'medium',
      '-crf', String(env.FFMPEG_CRF || 23),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-threads', String(env.FFMPEG_THREADS || 4),
      outputPath,
    ]);

    ffmpeg.stderr.on('data', (data) => {
      logger.debug({ videoId, ffmpeg: data.toString().trim() }, 'ffmpeg');
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        logger.info({ videoId, outputUrl }, 'Transcode complete');
        resolve({ outputUrl });
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

async function generateThumbnails(url: string, videoId: string): Promise<{ thumbnails: string[] }> {
  const timestamps = ['10%', '25%', '50%', '75%', '90%'];
  const thumbnails: string[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const outputPath = `/tmp/${videoId}_thumb_${i}.jpg`;
    await exec(
      `${env.FFMPEG_PATH} -ss ${timestamps[i]} -i "${url}" -vframes 1 -q:v 2 -vf scale=320:-1 ${outputPath}`,
    );

    const thumbUrl = `s3://${env.S3_BUCKET || 'san-story-media'}/thumbnails/${videoId}/${i}.jpg`;
    thumbnails.push(thumbUrl);

    await prisma.thumbnail.create({
      data: {
        videoId,
        url: thumbUrl,
        timestampSec: 0, // Will be calculated from actual timestamp
        width: 320,
        height: 180,
        isDefault: i === 0,
      },
    });
  }

  // Set first thumbnail as video poster
  await prisma.video.update({
    where: { id: videoId },
    data: { thumbnailUrl: thumbnails[0] },
  });

  return { thumbnails };
}

async function extractAudio(url: string, videoId: string): Promise<{ audioUrl: string }> {
  const outputPath = `/tmp/${videoId}_audio.mp3`;

  await exec(
    `${env.FFMPEG_PATH} -i "${url}" -vn -acodec libmp3lame -ab 128k -ar 44100 ${outputPath}`,
  );

  const audioUrl = `s3://${env.S3_BUCKET || 'san-story-media'}/audio/${videoId}.mp3`;

  await prisma.asset.create({
    data: {
      videoId,
      type: 'AUDIO',
      url: audioUrl,
      sizeBytes: BigInt(0), // Will be updated after upload
      mimeType: 'audio/mpeg',
      version: 1,
    },
  });

  return { audioUrl };
}

function parseFps(rate: string | undefined): number {
  if (!rate) return 0;
  const [num, den] = rate.split('/').map(Number);
  return den ? num / den : 0;
}

videoProcessor.on('completed', (job) => {
  logger.info({ jobId: job.id, videoId: job.data.videoId }, 'Video job completed');
});

videoProcessor.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, videoId: job?.data.videoId, err: err.message }, 'Video job failed');
});
