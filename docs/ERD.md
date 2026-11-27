# Database ERD — SAN STORY AI STUDIO

> ដ្ឋានសន្ទីយ៍ទិន្នន័យ | Entity-Relationship Diagram (PostgreSQL 16 + Prisma 5)

---

## 1. ទិដ្ឋភាពទូទៅ / Overview

The schema is organized into **8 logical domains** containing **30 entities**:

| Domain | Entities | Purpose |
|--------|----------|---------|
| Identity & Access | User, Account, Session, ApiKey, Role | Authentication, authorization, SSO |
| Organization | Team, TeamMember, Invitation, Subscription | Multi-tenancy, billing |
| Project | Project, ProjectMember, Tag | Workspace isolation |
| Media | Video, Asset, AssetVersion, Thumbnail | Uploaded & generated media |
| Translation | TranslationJob, Glossary, TranslationMemory, GlossaryEntry | Translation engine state |
| Subtitle | SubtitleTrack, SubtitleCue | ASR output, subtitle editing |
| TTS | TTSJob, Voice, VoicePreset | Text-to-speech synthesis |
| Summarization | SummaryJob, SummaryChapter | Story summarizer output |
| Analytics | UsageEvent, CostLog, AuditLog | Telemetry & compliance |

---

## 2. ERD Diagram (ASCII)

```
                                    ┌─────────────────┐
                                    │      USER       │
                                    │─────────────────│
                                    │ id (PK)         │
                                    │ email (UQ)      │
                                    │ passwordHash    │
                                    │ name            │
                                    │ avatarUrl       │
                                    │ locale          │
                                    │ twoFactorSecret │
                                    │ emailVerifiedAt │
                                    │ lastLoginAt     │
                                    │ createdAt       │
                                    │ updatedAt       │
                                    │ deletedAt       │
                                    └────────┬────────┘
                                             │ 1
                           ┌─────────────────┼─────────────────┐
                           │                 │                 │
                           │ 1               │ 1               │ 1
                           ▼                 ▼                 ▼
                  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐
                  │    ACCOUNT     │  │   SESSION    │  │    APIKEY    │
                  │────────────────│  │──────────────│  │──────────────│
                  │ id (PK)        │  │ id (PK)      │  │ id (PK)      │
                  │ userId (FK)    │  │ userId (FK)  │  │ userId (FK)  │
                  │ provider       │  │ token (UQ)   │  │ teamId (FK)  │
                  │ providerAccId  │  │ ip           │  │ name         │
                  │ accessToken    │  │ userAgent    │  │ keyHash (UQ) │
                  │ refreshToken   │  │ expiresAt    │  │ scopes       │
                  │ expiresAt      │  │ createdAt    │  │ rateLimit    │
                  │ createdAt      │  └──────────────┘  │ spendCap    │
                  │ updatedAt      │                    │ lastUsedAt  │
                  └────────────────┘                    │ expiresAt   │
                                                        │ createdAt   │
                                                        └──────────────┘

                                             │ 1
                                             │
                                             │ N
                                    ┌────────▼────────┐
                                    │      TEAM       │
                                    │─────────────────│
                                    │ id (PK)         │
                                    │ name            │
                                    │ slug (UQ)       │
                                    │ ownerId (FK)    │
                                    │ plan            │
                                    │ seatsUsed       │
                                    │ createdAt       │
                                    └────────┬────────┘
                                             │ 1
                                             │
                                             │ N
                          ┌──────────────────┼──────────────────┐
                          │                  │                  │
                          │ N                │ N                │ N
                          ▼                  ▼                  ▼
                ┌──────────────────┐ ┌──────────────┐  ┌──────────────┐
                │   TEAMMEMBER     │ │   PROJECT    │  │ SUBSCRIPTION │
                │──────────────────│ │──────────────│  │──────────────│
                │ id (PK)          │ │ id (PK)      │  │ id (PK)      │
                │ teamId (FK)      │ │ teamId (FK)  │  │ teamId (FK)  │
                │ userId (FK)      │ │ name         │  │ provider     │
                │ role             │ │ slug (UQ)    │  │ externalId   │
                │ invitedBy (FK)   │ │ description  │  │ status       │
                │ joinedAt         │ │ sourceLang   │  │ plan         │
                │ createdAt        │ │ targetLangs  │  │ seats        │
                └──────────────────┘ │ privacy      │  │ amountCents  │
                                     │ createdAt    │  │ currency     │
                                     │ updatedAt    │  │ currentStart │
                                     └──────┬───────┘  │ currentEnd   │
                                            │ 1        └──────────────┘
                                            │
                                            │ N
                              ┌─────────────┼─────────────┐
                              │             │             │
                              │ N           │ N           │ N
                              ▼             ▼             ▼
                  ┌────────────────┐ ┌────────────┐ ┌──────────────────┐
                  │     VIDEO      │ │PROJECTMEMBER│ │     GLOSSARY     │
                  │────────────────│ │────────────│ │──────────────────│
                  │ id (PK)        │ │ id (PK)    │ │ id (PK)          │
                  │ projectId (FK) │ │ projectId  │ │ projectId (FK)   │
                  │ uploaderId(FK) │ │ userId     │ │ name             │
                  │ title          │ │ role       │ │ sourceLang       │
                  │ description    │ │ createdAt  │ │ targetLang       │
                  │ originalUrl    │ └────────────┘ │ createdAt        │
                  │ durationSec    │               └────────┬─────────┘
                  │ width          │                        │ 1
                  │ height         │                        │
                  │ fps            │                        │ N
                  │ codec          │               ┌────────▼─────────┐
                  │ bitrate        │               │ GLOSSARYENTRY    │
                  │ sizeBytes      │               │──────────────────│
                  │ status         │               │ id (PK)          │
                  │ createdAt      │               │ glossaryId (FK)  │
                  │ updatedAt      │               │ source           │
                  └────────┬───────┘               │ target           │
                           │ 1                     │ context          │
                           │                       │ createdAt        │
                           │ N                     └──────────────────┘
                           ▼
                ┌────────────────────┐
                │     ASSET          │
                │────────────────────│
                │ id (PK)            │
                │ videoId (FK)       │
                │ type               │
                │ url                │
                │ sizeBytes          │
                │ mimeType           │
                │ version            │
                │ createdAt          │
                └────────┬───────────┘
                         │ 1
            ┌────────────┼────────────┐
            │            │            │
            │ N          │ N          │ N
            ▼            ▼            ▼
  ┌──────────────┐ ┌────────────┐ ┌──────────────┐
  │ASSETVERSION  │ │ THUMBNAIL  │ │TRANSLATIONJOB│
  │──────────────│ │────────────│ │──────────────│
  │ id (PK)      │ │ id (PK)    │ │ id (PK)      │
  │ assetId (FK) │ │ videoId    │ │ videoId (FK) │
  │ version      │ │ url        │ │ provider     │
  │ url          │ │ timestampSec│ │ sourceLang   │
  │ sizeBytes    │ │ width      │ │ targetLang   │
  │ createdBy    │ │ height     │ │ status       │
  │ createdAt    │ │ createdAt  │ │ progress     │
  └──────────────┘ └────────────┘ │ costCents    │
                                  │ tokensUsed   │
                                  │ startedAt    │
                                  │ completedAt  │
                                  │ error        │
                                  │ createdAt    │
                                  └──────┬───────┘
                                         │ 1
                                         │
                                         │ N
                                         ▼
                              ┌────────────────────┐
                              │  SUBTITLETRACK     │
                              │────────────────────│
                              │ id (PK)            │
                              │ translationJobId   │
                              │ videoId (FK)       │
                              │ lang               │
                              │ format (srt/vtt)   │
                              │ generatedBy        │
                              │ content (text)     │
                              │ createdAt          │
                              └────────┬───────────┘
                                       │ 1
                                       │
                                       │ N
                                       ▼
                              ┌────────────────────┐
                              │   SUBTITLECUE      │
                              │────────────────────│
                              │ id (PK)            │
                              │ trackId (FK)       │
                              │ index              │
                              │ startSec           │
                              │ endSec             │
                              │ text               │
                              │ speaker            │
                              │ createdAt          │
                              └────────────────────┘

  ┌──────────────┐                                    ┌──────────────┐
  │   TTSJOB     │                                    │  SUMMARYJOB  │
  │──────────────│                                    │──────────────│
  │ id (PK)      │                                    │ id (PK)      │
  │ videoId (FK) │                                    │ videoId (FK) │
  │ provider     │                                    │ provider     │
  │ voiceId (FK) │                                    │ targetLang   │
  │ text         │                                    │ style        │
  │ audioUrl     │                                    │ maxLength    │
  │ durationSec  │                                    │ status       │
  │ status       │                                    │ output       │
  │ costCents    │                                    │ costCents    │
  │ createdAt    │                                    │ createdAt    │
  └──────────────┘                                    └──────┬───────┘
                                                             │ 1
                                                             │
                                                             │ N
                                                             ▼
                                                  ┌──────────────────┐
                                                  │ SUMMARYCHAPTER   │
                                                  │──────────────────│
                                                  │ id (PK)          │
                                                  │ summaryJobId(FK) │
                                                  │ index            │
                                                  │ title            │
                                                  │ content          │
                                                  │ startSec         │
                                                  │ endSec           │
                                                  └──────────────────┘

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │    VOICE     │  │ VOICEPRESET  │  │ USAGEEVENT   │  │   AUDITLOG   │
  │──────────────│  │──────────────│  │──────────────│  │──────────────│
  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
  │ provider     │  │ teamId (FK)  │  │ teamId (FK)  │  │ actorId (FK) │
  │ externalId   │  │ name         │  │ userId (FK)  │  │ action       │
  │ name         │  │ voiceIds[]   │  │ resourceType │  │ resourceType │
  │ lang         │  │ settings     │  │ resourceId   │  │ resourceId   │
  │ gender       │  │ createdAt    │  │ metadata     │  │ before       │
  │ previewUrl   │  └──────────────┘  │ tokensUsed   │  │ after        │
  │ createdAt    │                    │ costCents    │  │ ip           │
  └──────────────┘                    │ createdAt    │  │ userAgent    │
                                      └──────────────┘  │ createdAt    │
                                                        └──────────────┘
```

---

## 3. Indexing Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| User | `email` | B-tree (unique) | Login lookup |
| User | `createdAt` | B-tree | Pagination |
| Video | `projectId, status` | Composite | Dashboard queries |
| Video | `uploaderId, createdAt` | Composite | User activity feed |
| TranslationJob | `videoId, status` | Composite | Job status filter |
| TranslationJob | `status, createdAt` | Composite | Worker dequeue |
| SubtitleCue | `trackId, index` | Composite | Sequential cue read |
| AuditLog | `actorId, createdAt` | Composite | User audit trail |
| AuditLog | `resourceType, resourceId` | Composite | Resource audit trail |
| UsageEvent | `teamId, createdAt` | Composite (BRIN) | Time-series analytics |

---

## 4. Constraints & Validations

### 4.1 Check Constraints
- `User.email` matches RFC 5322 regex
- `Video.durationSec > 0`
- `Video.width > 0 AND Video.height > 0`
- `TranslationJob.progress BETWEEN 0 AND 100`
- `SubtitleCue.endSec > SubtitleCue.startSec`

### 4.2 Foreign Keys (Cascade Rules)
- `Team.ownerId` → `User.id` (RESTRICT)
- `TeamMember.teamId` → `Team.id` (CASCADE on delete)
- `Project.teamId` → `Team.id` (CASCADE on delete)
- `Video.projectId` → `Project.id` (CASCADE on delete)
- `Asset.videoId` → `Video.id` (CASCADE on delete)
- `TranslationJob.videoId` → `Video.id` (SET NULL on delete, keep history)
- `ApiKey.userId` → `User.id` (CASCADE on delete)

### 4.3 Unique Constraints
- `User.email` (case-insensitive via `LOWER(email)`)
- `Team.slug` per owner
- `Project.slug` per team
- `ApiKey.keyHash` (globally unique)
- `Session.token` (globally unique)

---

## 5. Enumerations

```prisma
enum UserRole        { OWNER ADMIN EDITOR TRANSLATOR VIEWER API_ONLY }
enum TeamPlan        { FREE PRO BUSINESS ENTERPRISE }
enum VideoStatus     { PENDING UPLOADING PROCESSING READY FAILED ARCHIVED }
enum TranslationStatus { QUEUED TRANSLATING COMPLETED FAILED CANCELLED }
enum TTSStatus       { QUEUED SYNTHESIZING COMPLETED FAILED }
enum SummaryStatus   { QUEUED SUMMARIZING COMPLETED FAILED }
enum AssetType       { ORIGINAL TRANSCODED THUMBNAIL AUDIO SUBTITLE EXPORT }
enum SubtitleFormat  { SRT VTT ASS }
enum AuthProvider    { GOOGLE GITHUB LOCAL }
enum SubscriptionStatus { ACTIVE PAST_DUE CANCELED TRIALING }
```

---

## 6. Sample Queries

### 6.1 Dashboard: Recent Projects with Video Count
```sql
SELECT p.id, p.name, p.slug, COUNT(v.id) AS video_count, MAX(v.createdAt) AS last_upload
FROM "Project" p
LEFT JOIN "Video" v ON v."projectId" = p.id
WHERE p."teamId" = $1
GROUP BY p.id, p.name, p.slug
ORDER BY last_upload DESC NULLS LAST
LIMIT 20;
```

### 6.2 Cost Report per Team (Last 30 Days)
```sql
SELECT t.name AS team,
       DATE_TRUNC('day', u."createdAt") AS day,
       SUM(u."costCents") / 100.0 AS usd,
       SUM(u."tokensUsed") AS tokens
FROM "UsageEvent" u
JOIN "Team" t ON t.id = u."teamId"
WHERE u."createdAt" > NOW() - INTERVAL '30 days'
GROUP BY t.name, day
ORDER BY day ASC, t.name;
```

### 6.3 Active Translation Jobs for Worker
```sql
SELECT * FROM "TranslationJob"
WHERE status = 'QUEUED'
ORDER BY "createdAt" ASC
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

---

## 7. Migration Strategy

- Prisma Migrate generates SQL migrations stored in `prisma/migrations/`
- Each migration is reviewed and tested in staging before production
- Zero-downtime deployments via expand/contract pattern:
  1. Expand: add new column (nullable)
  2. Backfill: populate data
  3. Switch: deploy code reading new column
  4. Contract: drop old column (next release)

---

## 8. Backup & Recovery

- **Continuous WAL archiving** to S3 (RPO < 5 minutes)
- **Daily full snapshot** to cross-region bucket
- **Point-in-time recovery** up to 35 days
- **Quarterly restore drills** in isolated environment

---

## See Also

- [Prisma Schema](../prisma/schema.prisma) — Complete schema definition
- [Architecture Document](./ARCHITECTURE.md) — System design overview
