# System Architecture — SAN STORY AI STUDIO

> ឯកសារស្ថាបត្យកម្មប្រព័ន្ធ | Complete system design, data flow, and security model

---

## 1. ទិដ្ឋភាពទូទៅ / High-Level Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│   │  Web App     │  │  Mobile PWA  │  │  Public API  │                 │
│   │  (React 19)  │  │  (React)     │  │  Consumers   │                 │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
└──────────┼─────────────────┼─────────────────┼────────────────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       EDGE / CDN TIER                                  │
│   Cloudflare / Vercel Edge  •  TLS  •  WAF  •  Rate Limit              │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY (Express)                            │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│   │ Auth   │ │ Video  │ │Trans- │ │ TTS/   │ │Sub-    │ │Admin   │   │
│   │ Module │ │ Module │ │late   │ │ STT    │ │title   │ │Module  │   │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│   Middleware: JWT • RBAC • RateLimit • Audit • Zod Validation          │
└──────┬─────────────────────────────────────────────────────┬──────────┘
       │                                                     │
       ▼                                                     ▼
┌──────────────────────┐                       ┌─────────────────────────┐
│   PRIMARY DATABASE   │                       │     REDIS CACHE         │
│   PostgreSQL 16      │                       │   • Session store       │
│   • Prisma ORM       │                       │   • BullMQ queues       │
│   • Read replicas    │                       │   • Rate limit counters │
└──────────┬───────────┘                       └────────────┬────────────┘
           │                                                │
           ▼                                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     WORKER TIER (BullMQ)                              │
│   ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐    │
│   │  Video    │  │ Translate  │  │  TTS/    │  │  Summarize     │    │
│   │ Processor │  │ Processor  │  │  STT     │  │  Processor     │    │
│   └─────┬─────┘  └─────┬──────┘  └────┬─────┘  └───────┬────────┘    │
│         │              │              │                │              │
│         ▼              ▼              ▼                ▼              │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │            AI / ML PROVIDER ADAPTERS                         │    │
│   │  OpenAI  •  Gemini  •  Anthropic  •  Whisper  •  Azure TTS  │    │
│   └──────────────────────────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │            MEDIA PROCESSING (FFmpeg)                         │    │
│   │  Probe  •  Transcode  •  Thumbnail  •  Concat  •  Extract   │    │
│   └──────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     OBJECT STORAGE TIER                                │
│   Supabase Storage / S3  •  Original video • Transcoded • Subtitles   │
│   • Audio extracts • TTS output • Thumbnails • Exports                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ស្រទាប់ប្រព័ន្ធ / System Layers

### 2.1 Client Tier
- **Web App**: React 19 SPA served via Vite, hosted on Vercel/Cloudflare Pages
- **Mobile PWA**: Same React app wrapped as installable PWA
- **Public API**: Third-party consumers using API keys (rate-limited)

### 2.2 Edge / CDN
- Cloudflare provides TLS termination, WAF, DDoS protection, and edge caching
- Static assets served from edge; API requests forwarded to origin

### 2.3 API Gateway
- Single Express app exposing REST endpoints under `/api/v1`
- Internal modular monolith: each module owns its routes, services, and Prisma models
- Middleware pipeline: `requestId → logger → cors → helmet → rateLimit → auth → rbac → audit → validate → handler`

### 2.4 Database Tier
- **PostgreSQL 16**: Primary data store, accessed exclusively via Prisma ORM
- Read replica for analytics queries (via `prisma.$readReplica()`)
- Logical replication to data warehouse for BI

### 2.5 Cache & Queue Tier
- **Redis 7**: Used for session store, BullMQ job queues, rate-limit counters, and idempotency keys
- BullMQ Pro for scheduled jobs, flows, and parent-child dependencies

### 2.6 Worker Tier
- Long-running Node.js processes consuming BullMQ queues
- Each processor is isolated: failure in one job doesn't cascade
- Horizontal scaling via replica count

### 2.7 Storage Tier
- **Supabase Storage** (S3-compatible) for all binary assets
- Lifecycle policies: originals → warm storage (30d) → cold storage (90d) → delete (365d)
- Pre-signed URLs for direct client upload/download

---

## 3. ហ្គូហ្គោណាល់ ដេតាហ្វ្លូ / Data Flow

### 3.1 Video Translation Pipeline (Example)

```
User                Web              API              Queue            Worker          AI          Storage
 │                   │                │                │                │              │             │
 │── select file ──▶│                │                │                │              │             │
 │                   │── POST /upload │                │                │              │             │
 │                   │  (chunked)  ──▶│                │                │              │             │
 │                   │                │── presign  ────────────────────────────────────────────▶│   │
 │                   │                │◀────────────────────────────────────────────────────────│   │
 │                   │◀── presigned ──│                │                │              │             │
 │── PUT to S3 ──────────────────────────────────────────────────────────────────────────────▶│   │
 │                   │── POST /videos │                │                │              │             │
 │                   │  /finalize  ──▶│                │                │              │             │
 │                   │                │── enqueue ───▶│                │              │             │
 │                   │                │   probe       │                │              │             │
 │                   │◀── 202 Accepted│                │                │              │             │
 │                   │                │                │── dequeue ───▶│              │             │
 │                   │                │                │                │── ffprobe ──────────────▶│
 │                   │                │                │                │◀── metadata ────────────│
 │                   │                │                │                │── enqueue ─▶│             │
 │                   │                │                │                │  translate  │             │
 │                   │                │                │                │── POST ────▶│             │
 │                   │                │                │                │  /whisper   │             │
 │                   │                │                │                │◀── SRT ─────│             │
 │                   │                │                │                │── POST ────▶│             │
 │                   │                │                │                │  /translate │             │
 │                   │                │                │                │◀── SRT (km) │             │
 │                   │                │                │                │── enqueue ─▶│             │
 │                   │                │                │                │  tts        │             │
 │                   │                │                │                │── POST ────▶│             │
 │                   │                │                │                │  /azure-tts │             │
 │                   │                │                │                │◀── mp3 ─────│             │
 │                   │                │                │                │── ffmpeg ───────────────▶│
 │                   │                │                │                │  mux        │             │
 │                   │                │                │                │── upload ──────────────▶│
 │                   │                │                │                │  final mp4  │             │
 │                   │                │◀── status:done──────────────────│              │             │
 │                   │◀── SSE event ──│                │                │              │             │
 │── notify user ────│                │                │                │              │             │
```

### 3.2 Real-Time Updates
- Server-Sent Events (SSE) for job progress (avoids WebSocket complexity for unidirectional flow)
- Redis Pub/Sub fans out events to all API instances
- Client subscribes via `EventSource('/api/v1/jobs/:id/events')`

---

## 4. ម៉ូឌុល AI / AI Provider Adapters

Each AI provider is wrapped behind a common interface, allowing runtime swapping:

```typescript
interface TranslationProvider {
  name: 'openai' | 'gemini' | 'anthropic' | 'deepl';
  translate(input: TranslateRequest): Promise<TranslateResponse>;
  estimateCost(input: TranslateRequest): number;
  healthCheck(): Promise<boolean>;
}

interface STTProvider {
  name: 'whisper' | 'azure' | 'google';
  transcribe(audio: Buffer, opts: STTOptions): Promise<Transcript>;
}

interface TTSProvider {
  name: 'azure' | 'google' | 'elevenlabs';
  synthesize(text: string, voice: string): Promise<Buffer>;
}
```

### Provider Selection Strategy
1. **Cost optimization**: Pick cheapest provider that meets SLA
2. **Latency optimization**: Pick lowest-latency provider for live preview
3. **Quality optimization**: Use Claude Opus for literary translation, GPT-4o for technical
4. **Fallback chain**: Primary → Secondary → Tertiary (configurable per project)

---

## 5. ម៉ូឌុលសុវត្ថិភាព / Security Model

### 5.1 Authentication
- JWT (access) + Refresh token (httpOnly cookie)
- Optional 2FA via TOTP (Authenticator apps)
- SSO via Google, GitHub (OAuth 2.0)

### 5.2 Authorization (RBAC)
```
Roles: owner > admin > editor > translator > viewer > api_only
Permissions are scoped per resource (project, team, api_key)
```

### 5.3 Rate Limiting
- Per-IP: 100 req/min (anonymous), 1000 req/min (authenticated)
- Per-API-key: configurable per key (default 60 req/min)
- Per-endpoint: stricter limits on expensive operations (translate, tts)

### 5.4 Data Protection
- **At rest**: PostgreSQL TDE, S3 SSE-KMS, Redis TLS
- **In transit**: TLS 1.3 everywhere, mTLS for service-to-service
- **PII**: Column-level encryption for email, phone, billing address
- **Backups**: Daily snapshots, 30-day retention, cross-region replication

### 5.5 Audit Log
Every mutating operation is logged:
```
{ actor, action, resource, before, after, ip, ua, ts }
```
Logs are append-only and shipped to SIEM (Splunk/Elastic) via webhook.

---

## 6. Scalability & Reliability

### 6.1 Horizontal Scaling
- API: stateless, scales behind ALB (target CPU 70%)
- Workers: scale by queue depth (BullMQ metrics)
- Database: vertical scaling primary, horizontal read replicas

### 6.2 Multi-Region
- Primary region: `ap-southeast-1` (Singapore) — low latency for SEA
- Read replicas: `us-east-1`, `eu-west-1`
- Storage: S3 cross-region replication

### 6.3 Disaster Recovery
- RPO: 15 minutes (continuous WAL streaming)
- RTO: 4 hours (automated failover)
- Quarterly DR drills

---

## 7. Monitoring & Observability

| Layer | Tool |
|-------|------|
| Metrics | Prometheus + Grafana |
| Logs | Loki (structured JSON) |
| Traces | OpenTelemetry → Tempo |
| Errors | Sentry |
| Uptime | BetterStack |
| Synthetics | Checkly |

Key SLOs:
- API p99 latency < 500ms (excluding AI calls)
- AI translation p95 latency < 30s per minute of video
- Worker job success rate > 99.5%
- Upload success rate > 99.9%

---

## 8. Technology Decisions & Rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo vs Polyrepo | Monorepo (Turborepo) | Shared types, atomic commits, simpler CI |
| ORM | Prisma | Type safety, migrations, excellent DX |
| Queue | BullMQ | Mature, Redis-based, Pro features |
| Frontend state | Zustand + TanStack Query | Simple, no boilerplate, server-state separation |
| Real-time | SSE (not WebSocket) | Unidirectional suffices; simpler infra |
| Storage | Supabase | S3-compatible, integrated auth, generous free tier |
| Container | Docker Compose (dev), k8s (prod) | Right tool for each environment |

---

## 9. References

- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI Whisper](https://openai.com/research/whisper)
