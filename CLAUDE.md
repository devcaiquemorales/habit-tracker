# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (uses webpack)
bun build        # Production build
bun start        # Start production server
bun lint         # Run ESLint

# Convex backend (dev deployment; also regenerates convex/_generated)
npx convex dev

# Invites are owner-only; signup rejects anyone without one
npx convex run invites:create '{"email":"person@example.com"}'
```

`bun run test` runs domain tests (`bun test src`) and Convex tests (`vitest`, files named `convex/*.vitest.ts`).

## Architecture

This is a **Next.js 16 PWA** (App Router) using **TypeScript**, **TailwindCSS 4**, and **Convex** (database, server functions, cron) with **Better Auth** via `@convex-dev/better-auth`. Package manager is **Bun**.

### Layer structure (`src/`)

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `domain/types/`, `domain/lib/` | Core models (Habit, HeatmapMonthData, DateKey, Schedule), streak computation |
| Backend | `convex/` | Schema, queries, mutations, cron, Better Auth config. Every public function checks the owner; `userId` always comes from the session |
| Infrastructure | `src/infrastructure/auth/` | Better Auth client and Next.js server helpers |
| Presentation | `presentation/` | React components, custom hooks, i18n dictionaries, error utilities |
| App | `app/` | Next.js routes and the auth proxy route |

### Key conventions

- **`app/(app)/`** — protected routes (authenticated users)
- **`app/(auth)/`** — public auth routes (login, signup)
- **`presentation/lib/dashboard-context.tsx`** — one live `api.dashboard.get` subscription for all signed-in screens; streaks are derived on the client from log days
- **`presentation/hooks/use-dashboard-mutations.ts`** — every dashboard write, with optimistic updates
- **`presentation/hooks/use-safe-query.ts`** — use instead of `useQuery`, which throws during render
- **`convex/_generated/`** — auto-generated; never edit manually

### Data flow

1. **Dashboard load**: `DashboardProvider` subscribes to `api.dashboard.get`; a localStorage snapshot renders until live data arrives
2. **Logging a habit**: heatmap/day selection → `logs.mark` / `logs.unmark` mutation with optimistic update → Convex re-pushes the query
3. **Auth**: Better Auth runs in Convex and is proxied by `app/api/auth/[...all]`. `middleware.ts` checks cookie presence; `(app)/layout.tsx` validates the session
4. **Reminders**: hourly cron → `pushNode.dispatchReminders`; reminders exist only on whole hours

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
- Convex has no unique constraints: check before inserting, inside the mutation
- `shadcn/ui` + Radix UI for UI primitives; Lucide React for icons
