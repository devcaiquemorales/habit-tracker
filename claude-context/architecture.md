# Architecture

## Layer Structure

```
src/
├── app/              # Next.js routes, server actions, API routes
├── domain/           # Pure business logic — no framework deps
├── infrastructure/   # Supabase clients, repositories, mappers
├── presentation/     # React components, hooks, i18n, utilities
└── lib/              # Non-React utilities (locale resolution)
```

The dependency direction is: `app` → `infrastructure` → `domain` ← `presentation`.
Never import from `infrastructure` inside `presentation`; use server actions or SWR.

---

## App Layer (`src/app/`)

```
app/
├── (app)/            # Protected routes (auth required)
│   ├── page.tsx      # Dashboard home (SSR shell, no data — data loaded client-side)
│   ├── layout.tsx    # Auth guard — redirects to /login if no session
│   ├── habits/[habitId]/page.tsx   # Habit detail page
│   ├── settings/page.tsx           # Profile customization
│   └── lib/          # Dashboard data helpers
├── (auth)/           # Public auth routes
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── _offline/         # PWA offline fallback
├── auth/             # Supabase OAuth callback + password recovery
├── api/dashboard/route.ts    # SWR data endpoint (GET)
├── actions/          # Server actions (habit, habit-log, profile, sign-out)
├── forgot-password/
├── update-password/
├── layout.tsx        # Root layout
└── manifest.ts       # PWA manifest
```

### Route Groups

- `**(app)/**` — All routes here require authentication. The layout redirects to `/login` if no Supabase session is found.
- `**(auth)/**` — Login, signup, forgot password pages (no auth required).

---

## Domain Layer (`src/domain/`)

Pure TypeScript — no React, no Supabase. Safe to test in isolation.

```
domain/
├── types/
│   ├── habit.ts          # Habit interface + streak utils
│   ├── schedule.ts       # Schedule type union + day-checker utilities
│   ├── heatmap.ts        # HeatmapData, HeatmapMonthData, HeatmapDayCell
│   ├── user-profile.ts   # UserProfile interface
│   └── date-key.ts       # UTC & local date key utilities
├── lib/
│   └── compute-habit-streak.ts
└── constants/
    └── profile-limits.ts   # Max lengths for display name & motivation phrase
```

---

## Infrastructure Layer (`src/infrastructure/`)

All Supabase access lives here. Nothing outside this layer touches Supabase directly.

```
infrastructure/
├── supabase/
│   ├── client.ts         # Browser client (createBrowserSupabaseClient)
│   ├── server.ts         # SSR client (createServerSupabaseClient) — cookie-based
│   ├── middleware.ts     # Session refresh helper for Next.js middleware
│   ├── database.types.ts # AUTO-GENERATED — never edit manually; run `bun supabase:types`
│   └── env.ts            # Supabase env var loader
├── repositories/
│   ├── habit-repository.ts       # CRUD: habits + schedule + fixed_days
│   ├── habit-log-repository.ts   # CRUD: habit_logs
│   ├── profile-repository.ts     # Profiles with fallback to user_metadata
│   └── index.ts                  # Barrel export
└── mappers/
    └── habit-db-mapper.ts        # Domain ↔ Database conversion
```

---

## Presentation Layer (`src/presentation/`)

React components, hooks, i18n, and UI utilities.

```
presentation/
├── components/
│   ├── ui/                          # Radix UI wrappers (button, input, dialog, etc.)
│   ├── auth/                        # Auth forms
│   ├── home-dashboard-client/       # Main dashboard + SWR data management
│   ├── habit-card/                  # Habit card with mini heatmap
│   ├── habit-detail/                # Full habit view + large heatmap
│   ├── habit-form-dialog/           # Create/edit habit modal
│   ├── habit-heatmap/               # Heatmap rendering (cells, columns, month labels)
│   ├── create-habit-dialog/         # FAB + dialog wrapper
│   ├── habit-delete-confirm-dialog/
│   ├── edit-motivation-dialog/
│   ├── customization-screen/        # Profile settings
│   ├── add-habit-fab/               # Floating action button
│   ├── home-header/                 # Greeting + settings link
│   ├── sign-out-form/
│   └── pwa/                         # PWA install helpers
├── hooks/
│   ├── use-habit-order.ts           # localStorage habit ordering + drag sync
│   ├── use-habit-log-state.ts       # Selected activity date management
│   ├── use-scroll-to-far-right.ts   # Auto-scroll heatmap to latest month
│   └── use-horizontal-pan-navigation-suppression.ts
└── lib/
    ├── build-heatmap-data.ts        # Build HeatmapData from log keys
    ├── dashboard-cache.ts           # localStorage read/write for offline support
    ├── dashboard-swr.ts             # SWR fetcher + optimistic mutation helpers
    ├── habit-today-status.ts        # Is today completed?
    ├── habit-schedule-form.ts       # Schedule form helpers
    ├── heatmap-completed-keys.ts
    ├── heatmap-month-boundaries.ts
    ├── interaction-feedback.ts      # Haptic feedback (vibration API)
    ├── time-aware-greeting.ts       # Context-aware greeting messages
    ├── ui-haptics.ts
    ├── action-error.ts              # Typed action result wrapper
    ├── auth-error-message.ts        # User-friendly error formatting
    ├── utils.ts                     # cn() classNames helper
    └── i18n/                        # Internationalization system
        ├── i18n-provider.tsx
        ├── messages.ts
        ├── format.ts
        ├── format-schedule.ts
        └── dictionaries/
            ├── en.ts                # English (~300+ keys)
            └── pt.ts                # Portuguese (Brazil)
```

---

## Path Alias

`@/*` → `./src/*` (configured in `tsconfig.json`)

All imports use this alias: `import { Habit } from "@/domain/types/habit"`.