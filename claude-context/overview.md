# Habit Tracker — Project Overview

## What It Is

A mobile-first PWA for daily habit tracking using **GitHub-style contribution heatmaps**. Users create habits, log completions by tapping heatmap cells, and see streaks over time.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Database + Auth | Supabase (PostgreSQL + Auth) |
| Client Fetching | SWR 2.4 |
| Package Manager | Bun |
| Icons | Lucide React |
| PWA | @ducanh2912/next-pwa (Workbox) |
| Drag & Drop | @dnd-kit/sortable |

## Key Features

- GitHub-style heatmap per habit (12-month view)
- Multi-schedule types: daily, specific days, every other day, flexible, weekly target
- Supabase email/password auth
- Profile customization (display name + motivation phrase)
- PWA — installable, offline fallback via localStorage cache
- Internationalization: English + Portuguese (Brazil)
- Habit reordering via drag & drop
- Optimistic UI (SWR mutations before server response)

## Dev Commands

```bash
bun dev           # Start dev server (webpack)
bun build         # Production build
bun start         # Start production server
bun lint          # Run ESLint
bun supabase:types  # Regenerate DB TypeScript types from remote
```

## Constraints

- One log per habit per day (idempotent inserts)
- Logging must feel instant — <1s with optimistic UI
- Touch targets: 44×44px (iOS) / 48×48dp (Android)
- All dates in DB are UTC strings ("YYYY-MM-DD"); client uses local timezone
