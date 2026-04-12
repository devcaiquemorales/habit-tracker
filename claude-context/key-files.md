# Key Files Reference

## Routes & Pages

| File | Purpose |
|---|---|
| `app/(app)/page.tsx` | Dashboard home — SSR shell, no data |
| `app/(app)/layout.tsx` | Auth guard — redirects to `/login` if no session |
| `app/(app)/habits/[habitId]/page.tsx` | Habit detail page |
| `app/(app)/settings/page.tsx` | Profile customization |
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/signup/page.tsx` | Signup page |
| `app/api/dashboard/route.ts` | SWR data endpoint — returns DashboardJson |
| `app/_offline/page.tsx` | PWA offline fallback |

## Server Actions

| File | Actions |
|---|---|
| `app/actions/habit-actions.ts` | `createHabitAction`, `updateHabitAction`, `deleteHabitAction` |
| `app/actions/habit-log-actions.ts` | `logHabitDayAction`, `unlogHabitDayAction` |
| `app/actions/profile-actions.ts` | `updateProfileCustomizationAction`, `updateMotivationPhraseAction` |
| `app/actions/sign-out-action.ts` | `signOutAction` |

## Domain Models

| File | Contents |
|---|---|
| `domain/types/habit.ts` | `Habit` interface |
| `domain/types/schedule.ts` | `Schedule` union type + `isDayExpected()`, `isTodayScheduled()`, `isPastDayLoggable()` |
| `domain/types/heatmap.ts` | `HeatmapData`, `HeatmapMonthData`, `HeatmapDayCell` |
| `domain/types/date-key.ts` | UTC and local date key utilities |
| `domain/types/user-profile.ts` | `UserProfile` interface |
| `domain/lib/compute-habit-streak.ts` | Streak calculation logic |
| `domain/constants/profile-limits.ts` | Max lengths for display name + phrase |

## Infrastructure

| File | Purpose |
|---|---|
| `infrastructure/supabase/client.ts` | Browser Supabase client |
| `infrastructure/supabase/server.ts` | SSR Supabase client (cookie-based) |
| `infrastructure/supabase/middleware.ts` | Session refresh for Next.js middleware |
| `infrastructure/supabase/database.types.ts` | Auto-generated DB types — never edit manually |
| `infrastructure/repositories/habit-repository.ts` | Habit CRUD + schedule management |
| `infrastructure/repositories/habit-log-repository.ts` | Habit log CRUD |
| `infrastructure/repositories/profile-repository.ts` | Profile fetch + upsert |
| `infrastructure/mappers/habit-db-mapper.ts` | Domain ↔ DB conversion |

## Presentation — Components

| File | Purpose |
|---|---|
| `presentation/components/home-dashboard-client/` | Main dashboard — SWR, sorting, habit list |
| `presentation/components/habit-card/` | Single habit card with mini heatmap |
| `presentation/components/habit-detail/` | Full habit view + 12-month heatmap |
| `presentation/components/habit-form-dialog/` | Create/edit habit modal |
| `presentation/components/habit-heatmap/` | Heatmap grid rendering |
| `presentation/components/customization-screen/` | Profile settings UI |
| `presentation/components/auth/` | Login, signup, forgot password forms |
| `presentation/components/ui/` | Radix UI primitives (button, input, dialog...) |

## Presentation — Hooks

| File | Purpose |
|---|---|
| `presentation/hooks/use-habit-order.ts` | localStorage habit ordering + dnd sync |
| `presentation/hooks/use-habit-log-state.ts` | Selected date + completion overrides |
| `presentation/hooks/use-scroll-to-far-right.ts` | Auto-scroll heatmap to latest month |

## Presentation — Libraries

| File | Purpose |
|---|---|
| `presentation/lib/dashboard-swr.ts` | SWR config, `fetchDashboardJson`, optimistic mutations |
| `presentation/lib/dashboard-cache.ts` | localStorage read/write for offline support |
| `presentation/lib/build-heatmap-data.ts` | Construct `HeatmapData` from log keys |
| `presentation/lib/habit-today-status.ts` | Is today's habit completed? |
| `presentation/lib/interaction-feedback.ts` | Haptic + visual feedback |
| `presentation/lib/i18n/` | Internationalization system |

## Configuration

| File | Purpose |
|---|---|
| `src/middleware.ts` | Next.js middleware — locale + Supabase session |
| `next.config.ts` | PWA config + Next.js settings |
| `tailwind.config.ts` | Tailwind theme (dark mode, custom fonts) |
| `tsconfig.json` | TypeScript config + `@/*` alias |
| `components.json` | shadcn/ui config |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
