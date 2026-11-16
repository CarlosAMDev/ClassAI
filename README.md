# ClassAI

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-FF4154?style=flat&logo=tanstack&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_PostgreSQL-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat&logo=clerk&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)

**AI-powered ESL/EFL lesson plan generator.** Create complete, structured lesson plans in minutes: set the level, class type, duration and topic, and ClassAI generates the plan, saves it to your account and exports it as a formatted Word document.

<!-- Screenshots: add an image here, e.g. ![ClassAI dashboard](docs/screenshot.png) -->

## Features

- **AI generation** — plans generated through [OpenRouter](https://openrouter.ai) (model configurable, `openrouter/free` by default) with a system prompt that enforces a structured lesson plan format. Token usage is tracked per plan.
- **Plan management** — create, view, edit and delete plans; paginated list with search and filters; `draft` / `completed` / `archived` statuses.
- **Autosave drafts** — the plan form autosaves every change (3-second debounce, one draft per user), shows a “Draft saved” indicator and restores the draft on reload.
- **DOCX export** — one-click export to a formatted Word document (headings, paragraphs and lists with branded styling), generated server-side.
- **Dashboard** — total plans, monthly usage and recent plans at a glance.
- **Accounts & billing** — authentication and subscriptions with Clerk, including a pricing page with FAQ and a billing section in the dashboard. Free tier included (5 plans/month); Pro and School plans available.
- **Public pages** — landing, feature overview, pricing and help center.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + SSR + server functions), file-based routing with TanStack Router |
| Auth & billing | [Clerk](https://clerk.com) (`@clerk/tanstack-react-start`) |
| Database | [Supabase](https://supabase.com) PostgreSQL via [Prisma ORM](https://prisma.io) |
| AI | [OpenRouter](https://openrouter.ai) (`@openrouter/sdk`) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Export | [`docx`](https://github.com/dolanmiu/docx) for DOCX generation |
| Tooling | Vite, Vitest, ESLint, Prettier · Package manager: pnpm |

## Architecture

All database and AI operations run server-side via TanStack Start's `createServerFn` (`src/server/ai.ts`). Every function authenticates with Clerk, filters all Prisma queries by the user's `clerkUserId` (row-level security) and returns typed results to the client.

| Function | Method | Description |
|---|---|---|
| `generateLessonPlan` | POST | Generate plan via OpenRouter, save to DB, delete draft |
| `getPlansByUserId` | GET | Paginated list with search + filter |
| `getPlanById` | GET | Single plan by ID (owner-only) |
| `updatePlanFn` | POST | Update plan content/title (owner-only) |
| `deletePlanFn` | POST | Delete plan (owner-only) |
| `saveDraftFn` | POST | Upsert autosave draft (one per user) |
| `getDraftFn` | GET | Retrieve current user's draft |
| `exportDocxFn` | POST | Generate DOCX buffer, return base64 |
| `getDashboardStats` | GET | Stats: total plans, monthly usage, recent plans |

**Security**

- No secrets in source code: all keys live in `.env.local` (gitignored), validated at startup by `src/lib/env.ts`.
- AI calls, DB queries and DOCX generation run server-side only.
- Every query is scoped to the authenticated user.

## Quick start

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- A [Supabase](https://supabase.com) project (free tier works), a [Clerk](https://clerk.com) account and an [OpenRouter](https://openrouter.ai) API key

### 1. Install and configure

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `OPENROUTER_API_KEY` | OpenRouter API key | OpenRouter Dashboard → Keys |
| `DATABASE_URL` | Supabase pooler URL (port 6543) | Supabase → Settings → Database → Connection string (pooler) |
| `DATABASE_URL_UNPOOLED` | Supabase direct URL (port 5432) | Supabase → Settings → Database → Connection string (direct) |

### 2. Set up the database

Run this SQL in the Supabase SQL Editor:

<details>
<summary>Database schema (SQL)</summary>

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

</details>

### 3. Set up Clerk Billing (optional)

Enable Billing in the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=billing/settings) and create the plans below. The full configuration also ships in `clerk-billing-config.json` for programmatic setup via `clerk config patch`.

| Plan | Slug | Price | Features |
|------|------|-------|----------|
| Pro | `pro` | $12/month | `unlimited_plans`, `share_plans`, `export_pdf`, `analytics`, `priority_support` |
| School | `school` | $49/month | All Pro features + `admin_dashboard`, `api_access`, `custom_branding` |

Users without a subscription are on the free tier (5 plans/month).

### 4. Run

```bash
pnpm db:generate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

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

## Project structure

```
├── prisma/
│   └── schema.prisma          # Database schema (LessonPlan, Draft)
├── src/
│   ├── components/            # DashboardShell, Header, shadcn/ui components
│   ├── lib/
│   │   ├── env.ts             # Environment variable validation
│   │   ├── openrouter.ts      # OpenRouter AI service layer
│   │   ├── prisma.ts          # PrismaClient singleton
│   │   └── utils.ts           # cn() utility
│   ├── routes/
│   │   ├── __root.tsx         # Root route (ClerkProvider, Header)
│   │   ├── index.tsx          # Landing page
│   │   ├── overview.tsx       # Feature overview
│   │   ├── pricing.tsx        # Pricing page + FAQ
│   │   ├── help.tsx           # Help center
│   │   ├── dashboard.tsx      # Dashboard layout (protected)
│   │   └── dashboard/         # Overview, billing, settings, plans (list / new / detail)
│   ├── server/
│   │   ├── ai.ts              # All server functions (CRUD, AI, drafts, export)
│   │   └── docx.ts            # DOCX generation from markdown
│   └── styles.css             # Tailwind v4 + custom theme
├── .env.example               # Environment variable template
└── vite.config.ts             # Vite + TanStack Start config
```

## Deployment

```bash
pnpm build
```

Deploy the `dist/` output to any Node.js host, with the production environment variables set on the hosting platform.

## License

Private — All rights reserved.
