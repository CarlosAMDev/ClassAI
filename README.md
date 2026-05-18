# ClassAI

AI-powered ESL/EFL lesson plan generator. Create complete, structured lesson plans in minutes using AI, with Clerk authentication, Supabase PostgreSQL, and a modern TanStack Start frontend.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React + SSR + Server Functions)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Auth**: [Clerk](https://clerk.com) (`@clerk/tanstack-react-start`)
- **Database**: [Supabase PostgreSQL](https://supabase.com) via [Prisma ORM](https://prisma.io)
- **AI**: [OpenRouter](https://openrouter.ai) (`@openrouter/sdk`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Export**: [docx](https://github.com/dolanmiu/docx) for DOCX generation
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Supabase project (free tier works)
- Clerk account (free tier works)
- OpenRouter API key (free models available)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `OPENROUTER_API_KEY` | OpenRouter API key | OpenRouter Dashboard → Keys |
| `DATABASE_URL` | Supabase pooler URL (port 6543) | Supabase → Settings → Database → Connection string (pooler) |
| `DATABASE_URL_UNPOOLED` | Supabase direct URL (port 5432) | Supabase → Settings → Database → Connection string (direct) |

### 3. Set up the database

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TYPE "PlanStatus" AS ENUM ('draft', 'completed', 'archived');
CREATE TYPE "ClassType" AS ENUM ('listening', 'reading', 'writing', 'speaking', 'integrated');

CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classType" "ClassType" NOT NULL,
    "duration" TEXT NOT NULL,
    "studentCount" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "objectives" TEXT,
    "notes" TEXT,
    "content" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'completed',
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "title" TEXT,
    "level" TEXT,
    "classType" TEXT,
    "duration" TEXT,
    "studentCount" TEXT,
    "topic" TEXT,
    "objectives" TEXT,
    "notes" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lesson_plans_clerkUserId_idx" ON "lesson_plans"("clerkUserId");
CREATE INDEX "lesson_plans_clerkUserId_createdAt_idx" ON "lesson_plans"("clerkUserId", "createdAt" DESC);
CREATE INDEX "lesson_plans_clerkUserId_status_idx" ON "lesson_plans"("clerkUserId", "status");
CREATE INDEX "lesson_plans_createdAt_idx" ON "lesson_plans"("createdAt" DESC);
CREATE UNIQUE INDEX "drafts_clerkUserId_key" ON "drafts"("clerkUserId");
CREATE INDEX "drafts_clerkUserId_idx" ON "drafts"("clerkUserId");
```

### 4. Set up Clerk Billing

1. **Enable Billing**: Go to [Clerk Dashboard → Billing → Settings](https://dashboard.clerk.com/last-active?path=billing/settings) and enable billing
2. **Create Plans**: Go to [Clerk Dashboard → Billing → Plans](https://dashboard.clerk.com/last-active?path=billing/plans) and create:

| Plan | Slug | Price | Features |
|------|------|-------|----------|
| Pro | `pro` | $12/month | `unlimited_plans`, `share_plans`, `export_pdf`, `analytics`, `priority_support` |
| School | `school` | $49/month | All Pro features + `admin_dashboard`, `api_access`, `custom_branding` |

3. **Free tier**: No plan needed - users without a subscription are on the free tier (5 plans/month)

> **Note**: The file `clerk-billing-config.json` contains the full billing configuration for reference or programmatic setup via `clerk config patch`.

### 5. Generate Prisma client

```bash
pnpm db:generate
```

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Vitest tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier + ESLint fix |
| `pnpm check` | Check formatting with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to DB |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (LessonPlan, Draft)
├── src/
│   ├── components/
│   │   ├── DashboardShell.tsx  # Dashboard layout with sidebar
│   │   ├── Header.tsx          # Public header with auth buttons
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── env.ts              # Environment variable validation
│   │   ├── openrouter.ts       # OpenRouter AI service layer
│   │   ├── prisma.ts           # PrismaClient singleton
│   │   └── utils.ts            # cn() utility
│   ├── routes/
│   │   ├── __root.tsx          # Root route (ClerkProvider, Header)
│   │   ├── index.tsx           # Landing page
│   │   ├── overview.tsx        # Feature overview
│   │   ├── pricing.tsx         # Pricing page + FAQ
│   │   ├── help.tsx            # Help center
│   │   ├── dashboard.tsx       # Dashboard layout (protected)
│   │   └── dashboard/
│   │       ├── index.tsx       # Dashboard overview with stats
│   │       ├── billing.tsx     # Billing & subscription (Clerk PricingTable)
│   │       ├── settings.tsx    # User settings
│   │       └── plans/
│   │           ├── index.tsx   # Plans list with search/filter/pagination
│   │           ├── new.tsx     # Create plan with autosave drafts
│   │           └── $planId.tsx # Plan detail view/edit/export
│   ├── server/
│   │   ├── ai.ts               # All server functions (CRUD, AI, drafts, export)
│   │   └── docx.ts             # DOCX generation from markdown
│   └── styles.css              # Tailwind v4 + custom theme
├── .env.example                # Environment variable template
├── .env.local                  # Your secrets (gitignored)
└── vite.config.ts              # Vite + TanStack Start config
```

## Architecture

### Server Functions (`src/server/ai.ts`)

All database and AI operations run server-side via TanStack Start's `createServerFn`. Every function:

1. Calls `await auth()` from Clerk to get the user's `clerkUserId`
2. Filters all Prisma queries by `clerkUserId` (row-level security)
3. Returns typed results to the client

| Function | Method | Description |
|---|---|---|
| `generateLessonPlan` | POST | Generate plan via OpenRouter, save to DB, delete draft |
| `getPlansByUserId` | GET | Paginated list with search + filter |
| `getPlanById` | GET | Single plan by ID (owner-only) |
| `deletePlanFn` | POST | Delete plan (owner-only) |
| `updatePlanFn` | POST | Update plan content/title (owner-only) |
| `saveDraftFn` | POST | Upsert autosave draft (one per user) |
| `getDraftFn` | GET | Retrieve current user's draft |
| `exportDocxFn` | POST | Generate DOCX buffer, return base64 |
| `getDashboardStats` | GET | Stats: total plans, monthly usage, recent plans |

### AI Generation (`src/lib/openrouter.ts`)

- Uses `@openrouter/sdk` with model `openrouter/free` (configurable)
- System prompt enforces structured lesson plan format
- Returns content + token usage for billing/tracking
- Token tracking stored per plan in the database

### Autosave Drafts (`src/routes/dashboard/plans/new.tsx`)

- 3-second debounce on form changes
- Upserts to `Drafts` table (one draft per user)
- Draft restored on page reload via loader
- Shows "Draft saved HH:MM:SS" indicator

### DOCX Export (`src/server/docx.ts`)

- Parses markdown to structured sections (headings, paragraphs, lists)
- Generates formatted Word document with branded styling
- Returns base64 buffer for client-side download

## Security

- **No secrets in source code**: All keys in `.env.local` (gitignored)
- **Row-level security**: Every DB query filters by `clerkUserId` from Clerk auth
- **Server-only operations**: AI calls, DB queries, and DOCX generation run server-side
- **Environment validation**: `src/lib/env.ts` throws on missing required vars

## Deployment

Build the app and deploy the `dist/` output to any Node.js host:

```bash
pnpm build
```

Make sure production environment variables are set on your hosting platform.

## License

Private - All rights reserved
