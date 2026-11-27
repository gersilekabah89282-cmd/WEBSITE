# SAN STORY AI STUDIO — Ultimate Enterprise Edition

> AI Video Translation & Story Summarization Platform | មជ្ឈមណ្ឌលបកប្រែវីដេអូ AI និងសង្ខេបរឿង
>
> Production-grade web platform that combines AI-powered video translation, multi-language TTS/STT, automatic subtitle generation, and intelligent story summarization into a single enterprise workspace.

[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/gersilekabah89282-cmd/WEBSITE)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-20.x-339933.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg)](https://www.postgresql.org/)

---

## ភាពសង្ខេប / Overview

**SAN STORY AI STUDIO** គឺជាគម្រោង Full-Stack ដែលបង្រួបបង្រួមបច្ចេកវិទ្យា AI ទំនើបៗ (OpenAI / Gemini / Anthropic / Whisper) ជាមួយ pipeline ដំណើរការវីដេអូ (FFmpeg) ដើម្បីបង្កើតដំណោះស្រាយផ្តាច់មុខសម្រាប់អាជីពការផ្សាយភាពយន្ត សៀវភៅសម្លេង និងការបកប្រែមាតិកាពហុភាសា។

The platform is structured as a **monorepo** with a React/TypeScript frontend, Node.js/Express backend, Prisma ORM layer on PostgreSQL, Supabase for object storage, and a worker tier that runs FFmpeg + AI providers.

---

## លក្ខណៈពិសេសចម្បង / Core Features (15 Modules)

| # | Module | មុខងារ |
|---|--------|---------|
| 1 | Video Upload & Processing | Drag-drop uploader, chunked upload, FFmpeg probe + transcode |
| 2 | AI Translation Engine | Multi-provider (OpenAI / Gemini / Anthropic) with glossary & TM |
| 3 | Story Summarizer | Long-form narrative compression, chapter detection |
| 4 | Multi-language TTS | 80+ voices via Azure / Google / ElevenLabs |
| 5 | Subtitle Generation | Whisper-based ASR with SRT/VTT/ASS export |
| 6 | User Management | RBAC, SSO (Google/GitHub), 2FA, audit log |
| 7 | Project Workspace | Per-project asset isolation, kanban, comments |
| 8 | Media Library | Searchable asset repository with version history |
| 9 | Export & Distribution | MP4, MKV, MP3, PDF, EPUB; social presets |
| 10 | Analytics Dashboard | Usage, cost, latency, accuracy metrics |
| 11 | API Key Management | Per-team keys, rate-limit, spend cap |
| 12 | Team Collaboration | Real-time presence, roles, mentions |
| 13 | Version Control | Diff-based asset history, restore points |
| 14 | Webhook Integration | Outbound events for CI/CD pipelines |
| 15 | Admin Panel | System health, billing, impersonation |

---

## បច្ចេកវិទ្យាដែលបានប្រើ / Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript 5, Vite 6, Tailwind CSS 4, TanStack Query, Zustand, shadcn/ui |
| **Backend** | Node.js 20, Express 4, Prisma 5, Zod, BullMQ |
| **Database** | PostgreSQL 16 (primary), Redis 7 (queue + cache) |
| **Storage** | Supabase Storage / S3-compatible buckets |
| **AI / ML** | OpenAI, Google Gemini, Anthropic Claude, OpenAI Whisper, FFmpeg |
| **TTS / STT** | Azure Cognitive Services, Google TTS, ElevenLabs |
| **DevOps** | Docker, Docker Compose, GitHub Actions, Turborepo |
| **Monitoring** | OpenTelemetry, Grafana, Prometheus, Sentry |

---

## រចនាសម្ព័ន្ធថត / Folder Structure (Monorepo)

```
san-story-ai-studio/
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── features/       # Feature-based modules
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities, api clients
│   │   │   ├── pages/          # Route-level pages
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── styles/         # Global styles
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── api/                    # Express backend
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules (auth, video, translate, ...)
│   │   │   │   ├── auth/
│   │   │   │   ├── video/
│   │   │   │   ├── translate/
│   │   │   │   ├── summarize/
│   │   │   │   ├── tts/
│   │   │   │   ├── subtitle/
│   │   │   │   ├── project/
│   │   │   │   ├── media/
│   │   │   │   ├── analytics/
│   │   │   │   ├── admin/
│   │   │   │   └── webhook/
│   │   │   ├── middleware/     # Auth, error, rate-limit
│   │   │   ├── jobs/           # BullMQ workers
│   │   │   ├── services/       # AI provider adapters
│   │   │   │   ├── openai.adapter.ts
│   │   │   │   ├── gemini.adapter.ts
│   │   │   │   ├── anthropic.adapter.ts
│   │   │   │   ├── whisper.adapter.ts
│   │   │   │   ├── ffmpeg.service.ts
│   │   │   │   ├── azure-tts.adapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   ├── config/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── tsconfig.json
│   │
│   └── worker/                 # Background processing workers
│       ├── src/
│       │   ├── processors/
│       │   │   ├── video.processor.ts
│       │   │   ├── translate.processor.ts
│       │   │   ├── subtitle.processor.ts
│       │   │   ├── tts.processor.ts
│       │   │   └── summarize.processor.ts
│       │   └── index.ts
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                     # Shared UI component library
│   ├── types/                  # Shared TypeScript types
│   ├── config/                 # ESLint, TS, Tailwind configs
│   ├── sdk/                    # Generated API SDK
│   └── utils/                  # Shared utilities
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── nginx.conf
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── FOLDER_STRUCTURE.md
│   ├── PHASES.md
│   └── API.md
│
├── public/
│   ├── san-story-ai-studio.html   # Live dashboard prototype
│   ├── video-upload.html          # Standalone uploader
│   └── assets/
│
├── scripts/
│   ├── upload_server.py           # Python upload server
│   └── seed.mjs
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## ដំណាក់កាលអភិវឌ្ឍន៍ / Development Phases

| Phase | ឆ្នាំខែ | បញ្ហា | លទ្ធផល |
|-------|--------|------|--------|
| **Phase 1** | W1–2 | Core architecture, Auth, Upload | Monorepo setup, JWT auth, chunked upload |
| **Phase 2** | W3–4 | Video processing pipeline | FFmpeg probe, transcode, thumbnail |
| **Phase 3** | W5–6 | AI translation integration | Multi-provider adapter, glossary, TM |
| **Phase 4** | W7–8 | TTS / STT engine | Azure TTS, Whisper STT, voice presets |
| **Phase 5** | W9–10 | Story summarizer | Long-form compression, chapter detection |
| **Phase 6** | W11–12 | Collaboration features | Real-time presence, roles, mentions |
| **Phase 7** | W13 | Analytics & reporting | Cost/usage/latency dashboards |
| **Phase 8** | W14 | Admin & security hardening | 2FA, RBAC, audit log, pentest |
| **Phase 9** | W15–16 | Deployment & monitoring | Docker, CI/CD, OpenTelemetry, Grafana |

See [`docs/PHASES.md`](docs/PHASES.md) for the complete breakdown.

---

## ការដំឡើង / Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/gersilekabah89282-cmd/WEBSITE.git
cd WEBSITE
```

### 2. Install dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys (OpenAI, Gemini, Anthropic, Azure, etc.)
```

### 4. Start development services
```bash
# Start PostgreSQL + Redis via Docker
docker compose up -d postgres redis

# Run database migrations
pnpm --filter @san-story/api prisma:migrate

# Seed initial data
pnpm --filter @san-story/api prisma:seed

# Start all apps in dev mode
pnpm dev
```

### 5. Access the applications
| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API Server | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/docs |
| BullMQ Dashboard | http://localhost:4000/admin/queues |
| Prisma Studio | http://localhost:5555 |

---

## ការដាក់ពង្រាយ / Deployment

### Docker (Production)
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual build
```bash
pnpm build
pnpm --filter @san-story/web start
pnpm --filter @san-story/api start
```

---

## ឯកសារបន្ថែម / Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flow, security model
- [Database ERD](docs/ERD.md) — Entity-relationship diagram
- [Folder Structure](docs/FOLDER_STRUCTURE.md) — Detailed monorepo layout
- [Development Phases](docs/PHASES.md) — 9-phase delivery plan
- [Prisma Schema](prisma/schema.prisma) — Complete database schema
- [Live Dashboard Prototype](public/san-story-ai-studio.html) — Open in browser
- [Video Uploader (standalone)](public/video-upload.html) — Standalone demo

---

## អថេរបរិស្ថាន / Environment Variables

See [`.env.example`](.env.example) for the complete list. Key variables:

```env
# Database
DATABASE_URL="postgresql://san:san@localhost:5432/san_story"
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"

# AI Providers
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
ANTHROPIC_API_KEY="sk-ant-..."

# TTS / STT
AZURE_SPEECH_KEY="..."
AZURE_SPEECH_REGION="southeastasia"
ELEVENLABS_API_KEY="..."

# Storage
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_KEY="..."
S3_BUCKET="san-story-media"

# App
NODE_ENV="development"
PORT=4000
WEB_PORT=3000
```

---

## ការរួមចំណែក / Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please read `docs/PHASES.md` before contributing to align with the roadmap.

---

## អាជ្ញាប័ណ្ណ / License

MIT © 2026 SAN STORY AI STUDIO. See [LICENSE](LICENSE) for details.

---

## ទំនាក់ទំនង / Contact

- **Repository**: [github.com/gersilekabah89282-cmd/WEBSITE](https://github.com/gersilekabah89282-cmd/WEBSITE)
- **Issues**: [github.com/gersilekabah89282-cmd/WEBSITE/issues](https://github.com/gersilekabah89282-cmd/WEBSITE/issues)

---

> Built with passion for the Khmer-language AI community  |  សាងសង់ដោយសេចក្ដីស្រឡាញ់សម្រាប់សហគមន៍ AI ភាសាខ្មែរ
