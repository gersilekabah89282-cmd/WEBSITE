import { type Request, type Response, type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { createVideoSchema, finalizeUploadSchema, listVideosSchema } from './video.schema';
import { createVideo, finalizeUpload, getVideo, listVideos, deleteVideo } from './video.service';
import { requireAuth, type AuthedRequest } from '../../middleware/auth';

export const videoRouter: Router = ExpressRouter();

videoRouter.use(requireAuth);

videoRouter.post('/', async (req: AuthedRequest, res: Response) => {
  const { body } = createVideoSchema.parse({ body: req.body });
  const result = await createVideo(req.user!.sub, req.user!.teamId!, body);
  res.status(201).json({ ok: true, video: result });
});

videoRouter.post('/:id/finalize', async (req: AuthedRequest, res: Response) => {
  const { body } = finalizeUploadSchema.parse({ body: req.body });
  const video = await finalizeUpload(req.params.id, req.user!.sub, req.user!.teamId!, body);
  res.json({ ok: true, video });
});

videoRouter.get('/', async (req: AuthedRequest, res: Response) => {
  const { query } = listVideosSchema.parse({ query: req.query });
  const result = await listVideos(req.user!.sub, req.user!.teamId!, query);
  res.json({ ok: true, ...result });
});

videoRouter.get('/:id', async (req: AuthedRequest, res: Response) => {
  const video = await getVideo(req.params.id, req.user!.sub, req.user!.teamId!);
  res.json({ ok: true, video });
});

videoRouter.delete('/:id', async (req: AuthedRequest, res: Response) => {
  await deleteVideo(req.params.id, req.user!.sub, req.user!.teamId!);
  res.json({ ok: true });
});
