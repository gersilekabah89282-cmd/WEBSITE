# Folder Structure — SAN STORY AI STUDIO

> រចនាសម្ព័ន្ធថតមានរបស់ SAN STORY AI STUDIO | Detailed monorepo layout

This document explains every directory and file in the monorepo. The project uses **Turborepo** + **pnpm workspaces** for managing multiple apps and shared packages.

---

## 1. Top-Level Layout

```
san-story-ai-studio/
├── apps/                   # Application packages (web, api, worker)
├── packages/               # Shared libraries (ui, types, config, sdk, utils)
├── docker/                 # Dockerfiles and container configs
├── docs/                   # Project documentation
├── public/                 # Static HTML demos and assets
├── scripts/                # Utility scripts (Python upload server, seeders)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Development orchestration
├── package.json            # Root package.json (workspace root)
├── pnpm-workspace.yaml     # pnpm workspace declaration
├── turbo.json              # Turborepo pipeline config
├── tsconfig.base.json      # Shared TypeScript config
├── LICENSE                 # MIT license
└── README.md               # Project README
```

---

## 2. apps/ — Application Packages

### 2.1 apps/web/ — Frontend Application (React + Vite)

```
apps/web/
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # shadcn/ui primitives (button, dialog, ...)
│   │   ├── layout/                  # AppShell, Sidebar, TopBar, Footer
│   │   ├── video/                   # VideoPlayer, TimelineScrubber
│   │   ├── translation/             # TranslationEditor, GlossaryPicker
│   │   ├── subtitle/                # SubtitleList, SubtitleEditor
│   │   ├── tts/                     # VoicePicker, WaveformPreview
│   │   ├── upload/                  # Dropzone, UploadProgress
│   │   └── analytics/               # Charts, KPI cards
│   ├── features/                    # Feature-based modules
│   │   ├── auth/                    # Login, Register, 2FA flow
│   │   ├── dashboard/               # Main dashboard
│   │   ├── projects/                # Project workspace
│   │   ├── videos/                  # Video library + detail
│   │   ├── translate/               # Translation workflow
│   │   ├── subtitles/               # Subtitle editor
│   │   ├── tts/                     # TTS studio
│   │   ├── summarize/               # Summary viewer
│   │   ├── media/                   # Media library
│   │   ├── analytics/               # Analytics pages
│   │   ├── settings/                # User & team settings
│   │   └── admin/                   # Admin panel
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUpload.ts
│   │   ├── useTranslation.ts
│   │   ├── useTTS.ts
│   │   ├── useSubtitle.ts
│   │   ├── useAnalytics.ts
│   │   └── useSSE.ts                # Server-Sent Events hook
│   ├── lib/                         # Utilities and clients
│   │   ├── api.ts                   # Axios instance with interceptors
│   │   ├── auth.ts                  # Auth helpers (getToken, setToken)
│   │   ├── storage.ts               # LocalStorage helpers
│   │   ├── format.ts                # Date, currency, file size formatters
│   │   ├── validators.ts            # Zod schemas
│   │   └── constants.ts             # App-wide constants
│   ├── pages/                       # Route-level pages (React Router)
│   │   ├── _auth/                   # Authenticated routes
│   │   ├── _public/                 # Public routes (login, signup)
│   │   ├── dashboard.tsx
│   │   ├── projects/
│   │   ├── videos/
│   │   ├── translate/
│   │   ├── subtitles/
│   │   ├── tts/
│   │   ├── summarize/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── admin/
│   ├── stores/                      # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts               # Theme, sidebar, modals
│   │   ├── projectStore.ts
│   │   └── uploadStore.ts
│   ├── styles/                      # Global styles
│   │   ├── globals.css              # Tailwind base + custom CSS
│   │   └── themes.css               # Dark/Light theme variables
│   ├── types/                       # Frontend-specific types
│   │   ├── index.ts
│   │   ├── api.ts                   # API response types
│   │   └── models.ts                # Domain model types
│   ├── App.tsx                      # Root component with routes
│   ├── main.tsx                     # Vite entry point
│   └── router.tsx                  # React Router configuration
├── public/                          # Static assets served as-is
│   ├── favicon.ico
│   ├── manifest.json                # PWA manifest
│   └── robots.txt
├── index.html                       # Vite HTML template
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config (extends base)
├── tailwind.config.ts               # Tailwind config
├── postcss.config.js                # PostCSS config
└── package.json
```

### 2.2 apps/api/ — Backend API (Express + Prisma)

```
apps/api/
├── src/
│   ├── modules/                     # Feature modules
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.controller.ts   # Route handlers
│   │   │   ├── auth.service.ts      # Business logic
│   │   │   ├── auth.routes.ts       # Express routes
│   │   │   ├── auth.schema.ts       # Zod validation schemas
│   │   │   ├── auth.middleware.ts   # JWT verify, role check
│   │   │   └── auth.spec.ts         # Unit tests
│   │   ├── video/                   # Video upload & management
│   │   ├── translate/               # AI translation engine
│   │   ├── summarize/               # Story summarizer
│   │   ├── tts/                     # Text-to-speech
│   │   ├── subtitle/                # Subtitle generation & editing
│   │   ├── project/                 # Project workspace
│   │   ├── media/                   # Media library
│   │   ├── analytics/               # Analytics & reporting
│   │   ├── admin/                   # Admin panel endpoints
│   │   ├── webhook/                 # Outbound webhooks
│   │   ├── team/                    # Team & member management
│   │   ├── billing/                 # Subscription & invoices
│   │   └── health/                  # Health check endpoints
│   ├── middleware/                  # Global middleware
│   │   ├── error.ts                 # Central error handler
│   │   ├── rateLimit.ts             # Rate limiter
│   │   ├── audit.ts                 # Audit log writer
│   │   ├── cors.ts                  # CORS config
│   │   └── requestId.ts             # Adds X-Request-ID
│   ├── jobs/                        # BullMQ queue definitions
│   │   ├── queues.ts                # Queue instances
│   │   └── schedulers.ts            # Repeatable job schedulers
│   ├── services/                    # External service adapters
│   │   ├── openai.adapter.ts        # OpenAI API client
│   │   ├── gemini.adapter.ts        # Google Gemini client
│   │   ├── anthropic.adapter.ts     # Anthropic Claude client
│   │   ├── whisper.adapter.ts       # OpenAI Whisper STT
│   │   ├── azure-tts.adapter.ts     # Azure Cognitive Services TTS
│   │   ├── elevenlabs.adapter.ts    # ElevenLabs TTS
│   │   ├── ffmpeg.service.ts        # FFmpeg wrapper
│   │   ├── storage.service.ts       # Supabase/S3 storage
│   │   ├── email.service.ts         # Email (Resend/SendGrid)
│   │   ├── stripe.service.ts        # Stripe billing
│   │   └── index.ts                 # Barrel export
│   ├── utils/                       # Utility functions
│   │   ├── logger.ts                # Pino logger
│   │   ├── crypto.ts                # Encryption helpers
│   │   ├── hash.ts                  # Bcrypt wrapper
│   │   ├── jwt.ts                   # JWT sign/verify
│   │   ├── retry.ts                 # Retry with backoff
│   │   └── errors.ts                # Custom error classes
│   ├── config/                      # Configuration
│   │   ├── env.ts                   # Environment variable loader
│   │   ├── database.ts              # Prisma client singleton
│   │   ├── redis.ts                 # Redis client singleton
│   │   └── providers.ts             # AI provider config
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # HTTP server bootstrap
├── prisma/
│   ├── schema.prisma                # Prisma schema (root copy)
│   ├── migrations/                  # Migration history
│   │   └── 20260101000000_init/
│   │       └── migration.sql
│   └── seed.ts                      # Database seeder
├── tests/                           # Integration tests
│   ├── auth.test.ts
│   ├── video.test.ts
│   └── translate.test.ts
├── tsconfig.json
├── jest.config.js
└── package.json
```

### 2.3 apps/worker/ — Background Workers

```
apps/worker/
├── src/
│   ├── processors/                  # Job processors (one per queue)
│   │   ├── video.processor.ts       # FFmpeg probe, transcode, thumbnail
│   │   ├── translate.processor.ts   # Translation orchestration
│   │   ├── subtitle.processor.ts    # Whisper ASR
│   │   ├── tts.processor.ts         # TTS synthesis + mux
│   │   ├── summarize.processor.ts   # Story summarization
│   │   ├── export.processor.ts      # Export packaging
│   │   ├── webhook.processor.ts     # Webhook delivery + retries
│   │   └── cleanup.processor.ts     # Periodic storage cleanup
│   ├── index.ts                     # Worker bootstrap
│   └── config.ts                    # Worker-specific config
├── tsconfig.json
└── package.json
```

---

## 3. packages/ — Shared Libraries

### 3.1 packages/ui/ — Shared UI Component Library
```
packages/ui/
├── src/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Dialog.tsx
│   ├── Dropdown.tsx
│   ├── Toast.tsx
│   ├── Tooltip.tsx
│   ├── Skeleton.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── index.ts                     # Barrel export
└── package.json
```

### 3.2 packages/types/ — Shared TypeScript Types
```
packages/types/
├── src/
│   ├── api.ts                       # API request/response types
│   ├── models.ts                    # Domain models (User, Video, ...)
│   ├── events.ts                    # SSE event types
│   ├── enums.ts                     # Shared enumerations
│   └── index.ts
└── package.json
```

### 3.3 packages/config/ — Shared Configuration
```
packages/config/
├── eslint.base.js                   # Shared ESLint config
├── typescript.base.json             # Shared tsconfig
├── tailwind.base.js                 # Shared Tailwind config
├── prettier.base.js                 # Shared Prettier config
└── package.json
```

### 3.4 packages/sdk/ — Auto-Generated API SDK
```
packages/sdk/
├── src/
│   ├── client.ts                    # Generated API client
│   ├── models.ts                    # Generated models
│   └── index.ts
├── openapi.yaml                     # OpenAPI spec source
└── package.json
```

### 3.5 packages/utils/ — Shared Utilities
```
packages/utils/
├── src/
│   ├── format.ts                    # Date, currency, file size
│   ├── validation.ts                # Shared Zod schemas
│   ├── constants.ts                 # Shared constants
│   ├── i18n.ts                      # i18n helpers
│   └── index.ts
└── package.json
```

---

## 4. docker/ — Container Configurations

```
docker/
├── Dockerfile.web                   # Multi-stage build for web app
├── Dockerfile.api                   # Multi-stage build for API
├── Dockerfile.worker                # Multi-stage build for worker
├── nginx.conf                       # Nginx reverse proxy config
├── postgres.init.sql                # PostgreSQL init script
└── redis.conf                       # Redis config
```

---

## 5. docs/ — Documentation

```
docs/
├── ARCHITECTURE.md                  # System architecture overview
├── ERD.md                           # Entity-Relationship diagram
├── FOLDER_STRUCTURE.md              # This document
├── PHASES.md                        # Development phase plan
├── API.md                           # API reference
├── CONTRIBUTING.md                  # Contribution guidelines
├── SECURITY.md                      # Security policy
└── CHANGELOG.md                     # Release notes
```

---

## 6. public/ — Static Demos

```
public/
├── san-story-ai-studio.html         # Live dashboard prototype (single file)
├── video-upload.html                # Standalone video upload demo
└── assets/                          # Demo images, icons
```

These HTML files are self-contained (no build step) and demonstrate the UI/UX with mock data.

---

## 7. scripts/ — Utility Scripts

```
scripts/
├── upload_server.py                 # Python upload server (stdlib only)
├── seed.mjs                         # Database seeder script
├── generate-sdk.mjs                 # OpenAPI → SDK generator
├── backup-database.sh               # PostgreSQL backup script
└── deploy.sh                        # Production deploy script
```

---

## 8. Configuration Files

### 8.1 Root package.json
```json
{
  "name": "san-story-ai-studio",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write .",
    "db:migrate": "pnpm --filter @san-story/api prisma:migrate",
    "db:seed": "pnpm --filter @san-story/api prisma:seed",
    "db:studio": "pnpm --filter @san-story/api prisma:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 8.2 pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 8.3 turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

### 8.4 docker-compose.yml (Development)
Services: `postgres`, `redis`, `web`, `api`, `worker`, `mailhog`

### 8.5 .env.example
See [.env.example](../.env.example) for the full list of environment variables.

---

## 9. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files (TS/TSX) | kebab-case | `video-processor.ts` |
| React components | PascalCase | `VideoPlayer.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `TranslationJob` |
| Enums | PascalCase | `VideoStatus` |
| CSS classes | kebab-case | `.video-player` |
| Database tables | snake_case (plural) | `translation_jobs` |
| Database columns | snake_case | `created_at` |
| API routes | kebab-case | `/api/v1/translation-jobs` |

---

## 10. Module Anatomy

Every feature module in `apps/api/src/modules/<name>/` follows the same structure:

```
<name>/
├── <name>.controller.ts    # HTTP handlers (req → service → res)
├── <name>.service.ts       # Business logic (DB calls, AI calls)
├── <name>.routes.ts        # Express router definition
├── <name>.schema.ts        # Zod schemas for input validation
├── <name>.middleware.ts    # Module-specific middleware
├── <name>.events.ts        # SSE event emitters (optional)
└── <name>.spec.ts          # Unit tests
```

This pattern ensures:
- **Separation of concerns**: HTTP layer ≠ business logic
- **Testability**: Services can be unit-tested without HTTP context
- **Discoverability**: New developers can find any module's code in one place
- **Consistency**: All modules look the same, reducing cognitive load
