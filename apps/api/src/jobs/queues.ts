import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../config/redis';

export const QUEUE_NAMES = {
  VIDEO: 'video',
  TRANSLATE: 'translate',
  SUBTITLE: 'subtitle',
  TTS: 'tts',
  SUMMARIZE: 'summarize',
  EXPORT: 'export',
  WEBHOOK: 'webhook',
  CLEANUP: 'cleanup',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

export const queues: Record<QueueName, Queue> = {
  video: new Queue(QUEUE_NAMES.VIDEO, { connection: redis }),
  translate: new Queue(QUEUE_NAMES.TRANSLATE, { connection: redis }),
  subtitle: new Queue(QUEUE_NAMES.SUBTITLE, { connection: redis }),
  tts: new Queue(QUEUE_NAMES.TTS, { connection: redis }),
  summarize: new Queue(QUEUE_NAMES.SUMMARIZE, { connection: redis }),
  export: new Queue(QUEUE_NAMES.EXPORT, { connection: redis }),
  webhook: new Queue(QUEUE_NAMES.WEBHOOK, { connection: redis }),
  cleanup: new Queue(QUEUE_NAMES.CLEANUP, { connection: redis }),
};

export const queueEvents: Record<QueueName, QueueEvents> = {
  video: new QueueEvents(QUEUE_NAMES.VIDEO, { connection: redis }),
  translate: new QueueEvents(QUEUE_NAMES.TRANSLATE, { connection: redis }),
  subtitle: new QueueEvents(QUEUE_NAMES.SUBTITLE, { connection: redis }),
  tts: new QueueEvents(QUEUE_NAMES.TTS, { connection: redis }),
  summarize: new QueueEvents(QUEUE_NAMES.SUMMARIZE, { connection: redis }),
  export: new QueueEvents(QUEUE_NAMES.EXPORT, { connection: redis }),
  webhook: new QueueEvents(QUEUE_NAMES.WEBHOOK, { connection: redis }),
  cleanup: new QueueEvents(QUEUE_NAMES.CLEANUP, { connection: redis }),
};

export async function enqueueVideoProcessing(videoId: string, type: 'probe' | 'transcode' | 'thumbnail' | 'extract-audio') {
  await queues.video.add(type, { videoId, type }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export async function enqueueTranslation(videoId: string, provider: string, sourceLang: string, targetLang: string) {
  await queues.translate.add('translate', { videoId, provider, sourceLang, targetLang }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  });
}
