# Development Phases — SAN STORY AI STUDIO

> ផែនការអភិវឌ្ឍន៍ 9 ដំណាក់កាល | 9-phase delivery plan

Each phase delivers a vertical slice of functionality that is demoable and independently testable. Phases are sequential, but work within a phase can be parallelized across team members.

**Total duration**: 16 weeks (4 months)
**Team size**: 2-3 full-stack engineers + 1 DevOps
**Methodology**: 2-week sprints with mid-sprint demo

---

## Phase 1: Core Architecture, Auth & Upload (Weeks 1–2)

### Goals
Establish the monorepo foundation, authentication system, and video upload pipeline.

### Deliverables
- [ ] Turborepo + pnpm workspace setup
- [ ] Shared `packages/` (types, config, utils)
- [ ] `apps/web` scaffolded with React + Vite + Tailwind + shadcn/ui
- [ ] `apps/api` scaffolded with Express + Prisma + Zod
- [ ] PostgreSQL + Redis Docker Compose
- [ ] User model + email/password auth
- [ ] JWT access + refresh token flow
- [ ] Email verification (Resend)
- [ ] 2FA TOTP setup
- [ ] Google + GitHub OAuth (SSO)
- [ ] Chunked upload endpoint (tus-style)
- [ ] Direct-to-S3 presigned URL upload
- [ ] Video model + metadata extraction (FFprobe)
- [ ] Basic dashboard UI (project list, recent uploads)
- [ ] Login, Register, Forgot Password pages

### Acceptance Criteria
- User can sign up, verify email, log in, enable 2FA
- User can connect Google/GitHub account
- User can upload a 1 GB video via chunked upload
- Video metadata (duration, resolution, codec) is extracted on upload
- Dashboard shows uploaded videos with thumbnails

### Key Technical Decisions
- Use **tus protocol** for resumable uploads (via `tus-node-server`)
- Pre-signed URLs for direct S3 upload (bypasses API for binary data)
- FFprobe runs in worker, not in API request cycle

---

## Phase 2: Video Processing Pipeline (Weeks 3–4)

### Goals
Build the FFmpeg-based video processing pipeline: transcoding, thumbnail generation, audio extraction.

### Deliverables
- [ ] BullMQ queue infrastructure
- [ ] `apps/worker` process scaffolded
- [ ] FFmpeg service wrapper (`ffmpeg.service.ts`)
- [ ] Transcode job: any input → H.264/AAC MP4 (web-optimized)
- [ ] Thumbnail job: generate 5 thumbnails at 10%, 25%, 50%, 75%, 90%
- [ ] Audio extraction job: extract audio track as MP3
- [ ] Asset model + version history
- [ ] Video status machine (PENDING → UPLOADING → PROCESSING → READY/FAILED)
- [ ] SSE endpoint for job progress
- [ ] Video detail page with player + thumbnails timeline
- [ ] Re-process button (retry failed jobs)

### Acceptance Criteria
- Uploaded video is automatically transcoded to web-optimized MP4
- 5 thumbnails are generated and selectable as poster
- Audio is extracted and available for download
- User sees real-time progress bar during processing
- Failed jobs can be retried from UI

---

## Phase 3: AI Translation Integration (Weeks 5–6)

### Goals
Integrate multiple AI translation providers with a unified adapter pattern.

### Deliverables
- [ ] Translation provider adapters (OpenAI, Gemini, Anthropic, DeepL)
- [ ] Provider selection strategy (cost / latency / quality)
- [ ] TranslationJob model + queue
- [ ] Source text extraction from subtitles
- [ ] Glossary model + CRUD UI
- [ ] Glossary application during translation
- [ ] Translation Memory (TM) for repeated segments
- [ ] Translation editor UI (side-by-side source/target)
- [ ] Diff view for edits
- [ ] Batch translation of all cues
- [ ] Per-cue re-translation
- [ ] Cost estimation before running job
- [ ] Provider fallback chain

### Acceptance Criteria
- User can translate subtitles from English to Khmer (and 30+ other languages)
- Glossary terms are consistently translated
- TM improves speed for repeated content
- User can edit translations inline
- Cost is estimated before job runs
- If primary provider fails, secondary provider is used

---

## Phase 4: TTS / STT Engine (Weeks 7–8)

### Goals
Add speech-to-text (Whisper) for automatic subtitle generation and text-to-speech (Azure, ElevenLabs) for audio dubbing.

### Deliverables
- [ ] Whisper STT adapter (via OpenAI API or local whisper.cpp)
- [ ] SubtitleTrack + SubtitleCue models
- [ ] ASR job: audio → SRT/VTT with timestamps
- [ ] Speaker diarization (identify different speakers)
- [ ] Confidence scores per cue
- [ ] Subtitle editor UI (list view + timeline view)
- [ ] Inline cue editing
- [ ] Azure TTS adapter (80+ voices)
- [ ] ElevenLabs TTS adapter (premium voices)
- [ ] Voice model + voice picker UI
- [ ] Voice preset system (team-level voice configs)
- [ ] TTS job: text → MP3 audio
- [ ] Audio-video muxing (replace or add audio track)
- [ ] Multi-voice TTS (different voice per speaker)

### Acceptance Criteria
- User clicks "Generate Subtitles" and gets SRT within minutes
- Subtitles are editable with confidence highlighting
- User can synthesize Khmer voice from translated text
- Final video has dubbed audio in target language
- Different speakers can have different voices

---

## Phase 5: Story Summarizer (Weeks 9–10)

### Goals
Build the AI story summarizer that compresses long-form video content into readable summaries.

### Deliverables
- [ ] SummaryJob model + queue
- [ ] Provider adapters for summarization (Claude Opus for literary, GPT-4o for technical)
- [ ] Long-form context handling (chunking + map-reduce)
- [ ] Chapter detection (semantic segmentation)
- [ ] SummaryChapter model
- [ ] Summary styles: Brief, Detailed, Chaptered, Narrative
- [ ] Summary viewer UI (collapsible chapters)
- [ ] Export summary as PDF, EPUB, Markdown
- [ ] Summary in multiple languages (translate summary)
- [ ] Summary regeneration with different style

### Acceptance Criteria
- 1-hour video is summarized in under 5 minutes
- Summary has detected chapters with timestamps
- User can switch between Brief and Detailed styles
- Summary can be exported as PDF
- Summary can be translated to any supported language

---

## Phase 6: Collaboration Features (Weeks 11–12)

### Goals
Enable team collaboration: real-time presence, roles, comments, mentions.

### Deliverables
- [ ] Team model + TeamMember model (already from Phase 1, now used)
- [ ] Role-based access control (OWNER, ADMIN, EDITOR, TRANSLATOR, VIEWER)
- [ ] Invitation system (email-based)
- [ ] Project sharing UI
- [ ] Real-time presence (who is viewing/editing)
- [ ] Comments on videos, translations, subtitles
- [ ] @mentions with email notifications
- [ ] Activity feed (team-level)
- [ ] Version history for translations and subtitles
- [ ] Restore previous version
- [ ] Inline suggestions (Google Docs-style)
- [ ] Email digests (daily/weekly)

### Acceptance Criteria
- Multiple users can edit the same project simultaneously
- Users see each other's cursors in real-time
- Comments can be resolved
- @mentioned users get email notification
- All edits are versioned and restorable

---

## Phase 7: Analytics & Reporting (Weeks 13)

### Goals
Build the analytics dashboard with usage, cost, latency, and accuracy metrics.

### Deliverables
- [ ] UsageEvent model (already from Phase 1, now populated)
- [ ] Cost tracking per AI call
- [ ] Dashboard with KPI cards (videos processed, minutes translated, cost)
- [ ] Time-series charts (usage over time)
- [ ] Provider comparison (cost vs. quality)
- [ ] Team-level vs. project-level filtering
- [ ] Export reports as CSV/PDF
- [ ] Budget alerts (email when spend exceeds threshold)
- [ ] API usage analytics (for API key consumers)
- [ ] Latency percentile charts (p50, p95, p99)

### Acceptance Criteria
- Admin sees team-level cost breakdown
- Charts update in real-time as jobs complete
- Budget alerts fire when spend crosses 80%, 90%, 100% of cap
- Reports can be scheduled (weekly email)

---

## Phase 8: Admin & Security Hardening (Week 14)

### Goals
Build the admin panel and harden security for production.

### Deliverables
- [ ] Admin panel (system health, user management, billing)
- [ ] User impersonation (for support)
- [ ] Audit log viewer with filtering
- [ ] API key management UI
- [ ] Rate limit configuration per API key
- [ ] Spend cap enforcement
- [ ] Security audit (OWASP Top 10)
- [ ] Penetration test (external)
- [ ] Dependency audit (`pnpm audit`)
- [ ] CSP, HSTS, X-Frame-Options headers
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping + DOMPurify for user HTML)
- [ ] CSRF protection (double-submit cookie)
- [ ] Secrets rotation procedure
- [ ] GDPR compliance (data export, data deletion)
- [ ] Backup verification (restore drill)

### Acceptance Criteria
- Admin can manage users (suspend, delete, impersonate)
- All mutating actions are in audit log
- External pentest report has no critical findings
- Backup can be restored in under 4 hours

---

## Phase 9: Deployment & Monitoring (Weeks 15–16)

### Goals
Deploy to production with full observability and CI/CD.

### Deliverables
- [ ] GitHub Actions CI pipeline (lint, test, build, security scan)
- [ ] GitHub Actions CD pipeline (deploy on merge to main)
- [ ] Docker images for web, api, worker
- [ ] Kubernetes manifests (or Docker Compose for smaller deployments)
- [ ] Database migration automation (prisma migrate deploy)
- [ ] Health check endpoints (`/health`, `/ready`)
- [ ] OpenTelemetry instrumentation (traces)
- [ ] Prometheus metrics endpoint (`/metrics`)
- [ ] Grafana dashboards (API, workers, database, queue)
- [ ] Sentry error tracking
- [ ] BetterStack uptime monitoring
- [ ] Checkly synthetic monitoring (critical user journeys)
- [ ] Log aggregation (Loki or CloudWatch)
- [ ] Alerting rules (PagerDuty integration)
- [ ] Runbook for common incidents
- [ ] Load testing (k6) with documented SLOs
- [ ] Blue-green deployment strategy
- [ ] Database connection pooling (PgBouncer)

### Acceptance Criteria
- Merging to `main` triggers automatic deployment to staging
- Manual promotion from staging to production
- All services have health checks
- Grafana dashboards show real-time metrics
- Alerts fire on SLO breach
- Load test sustains 1000 RPS with p99 < 500ms

---

## Phase Summary Table

| Phase | Weeks | Duration | Focus | Key Deliverable |
|-------|-------|----------|-------|-----------------|
| 1 | W1–2 | 2 weeks | Foundation | Auth + Upload |
| 2 | W3–4 | 2 weeks | Video | FFmpeg pipeline |
| 3 | W5–6 | 2 weeks | Translation | Multi-provider AI |
| 4 | W7–8 | 2 weeks | Audio | Whisper + TTS |
| 5 | W9–10 | 2 weeks | Summary | Story summarizer |
| 6 | W11–12 | 2 weeks | Collaboration | Real-time editing |
| 7 | W13 | 1 week | Analytics | Cost & usage |
| 8 | W14 | 1 week | Security | Hardening + admin |
| 9 | W15–16 | 2 weeks | DevOps | Prod deployment |
| **Total** | **W1–16** | **16 weeks** | | **MVP → Production** |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI provider outage | Medium | High | Multi-provider fallback chain |
| FFmpeg memory leaks | Medium | Medium | Worker restart on OOM, isolate processes |
| Database migration locks | Low | High | Expand/contract pattern, run during low traffic |
| Cost overrun from AI | Medium | High | Spend caps per team, budget alerts at 80% |
| Whisper accuracy for Khmer | High | Medium | Fine-tune on Khmer corpus, allow manual correction |
| S3 upload failures | Low | Medium | Retry with exponential backoff, idempotent uploads |

---

## Definition of Done

A phase is considered "done" when:
1. All deliverables are merged to `main`
2. All acceptance criteria are met
3. CI pipeline is green
4. Documentation is updated
5. Demo is recorded and shared
6. Stakeholders sign off
