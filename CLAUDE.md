# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (uses webpack)
bun build        # Production build
bun start        # Start production server
bun lint         # Run ESLint

# Regenerate Supabase TypeScript types from remote DB
bun supabase:types
```

There is no test suite configured.

## Architecture

This is a **Next.js 16 PWA** (App Router) using **TypeScript**, **TailwindCSS 4**, **Supabase** (auth + PostgreSQL), and **SWR** for client-side data fetching. Package manager is **Bun**.

### Layer structure (`src/`)

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `domain/types/`, `domain/lib/` | Core models (Habit, HeatmapMonthData, DateKey, Schedule), streak computation |
| Infrastructure | `infrastructure/` | Supabase clients (client vs server), repositories (habit, habit-log, profile), DB↔domain mappers |
| Presentation | `presentation/` | React components, custom hooks, i18n dictionaries, error utilities |
| App | `app/` | Next.js routes, server actions, API routes |

### Key conventions

- **`app/(app)/`** — protected routes (authenticated users)
- **`app/(auth)/`** — public auth routes (login, signup)
- **`app/actions/`** — server actions; call repositories and use `revalidatePath()` to refresh data
- **`app/api/dashboard/`** — API route serving dashboard data for SWR
- **`infrastructure/supabase/client.ts`** — browser Supabase client; **`server.ts`** — SSR client (cookie-based)
- **`infrastructure/supabase/database.types.ts`** — auto-generated; never edit manually, run `bun supabase:types`

### Data flow

1. **Dashboard load**: Server renders initial data → client hydrates with SWR for subsequent updates
2. **Logging a habit**: Heatmap cell click → `logHabitDayAction` (server action) → `habit-log-repository` → Supabase → `revalidatePath()`
3. **Auth**: Supabase SSR middleware in `infrastructure/supabase/middleware.ts`, enforced via Next.js `middleware.ts`

### Path aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Product context

- **Core UX**: GitHub-style contribution heatmaps for daily habit tracking
- **Constraint**: One log per habit per day (idempotent inserts)
- **Performance**: Logging must be <1 second; instant UI feedback is critical
- **Mobile-first PWA**: Touch targets 44×44px (iOS) / 48×48dp (Android); offline fallback at `/_offline`

## Coding standards

- All code in **English**
- Mobile-first with Tailwind responsive utilities
- One component per file, **kebab-case** filenames
- SOLID principles; keep infrastructure/domain/presentation boundaries clean
- `shadcn/ui` + Radix UI for UI primitives; Lucide React for icons
