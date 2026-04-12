# Coding Standards & Conventions

## General

- All code in **English** (variable names, comments, commit messages)
- **TypeScript strict mode** — no `any`
- **Bun** as package manager — use `bun add`, not `npm install`
- One component per file, **kebab-case** filenames
- SOLID principles — keep layer boundaries clean (don't import infrastructure from presentation)

## Architecture Rules

- Infrastructure (Supabase) is only accessed from:
  - Server actions (`app/actions/`)
  - API routes (`app/api/`)
  - Repositories (`infrastructure/repositories/`)
- Presentation components never call repositories directly — only through server actions or SWR
- Domain layer has zero framework/library dependencies

## Styling

- **Mobile-first** with Tailwind responsive utilities
- **TailwindCSS 4** — uses CSS variables, not `tailwind.config.ts` for colors
- `shadcn/ui` + Radix UI for UI primitives
- Lucide React for icons
- `cn()` utility from `presentation/lib/utils.ts` for conditional classNames
- Dark mode is the default / primary theme
- Touch targets: minimum 44×44px (iOS) / 48×48dp (Android)

## Components

- Use `shadcn/ui` primitives first before building custom UI
- Dialog components wrap Radix `AlertDialog` or `Dialog`
- Forms use uncontrolled inputs where possible; use `react-hook-form` only if needed
- Don't add error handling for impossible cases — trust TypeScript types

## Data Fetching

- Client data: SWR pointing to `/api/dashboard`
- Mutations: server actions with `revalidatePath()` + optimistic SWR mutations
- Optimistic UI: always update SWR cache before the server action resolves
- SWR dedup interval: 60 seconds

## Date Handling

- **Server / DB**: UTC date keys via `getUtcToday()`, `toUtcDateKey()`
- **Client / UI**: Local timezone keys via `getLocalToday()`, `toLocalDateKey()`
- All `log_date` stored in DB as `"YYYY-MM-DD"` UTC strings
- Never use `new Date().toISOString().split("T")[0]` on client — use the local key utils

## i18n

- All user-facing strings go through the i18n system
- Add keys to both `en.ts` and `pt.ts` (Brazilian Portuguese)
- Use `useI18n()` hook in components to get the `t()` translator
- For server-side strings: use `getServerAppLocale()` + load dictionary

## Performance

- Keep dashboard load instant: SWR cache seed from localStorage on mount
- Log action feedback must be immediate — use optimistic UI, don't wait for server
- Use `router.prefetch()` for habit detail pages (on card mount)
- Heatmap cells are intentionally simple divs — no heavy abstractions

## PWA

- Service Worker only in production (disabled in dev)
- Offline fallback at `/_offline` — served from app shell cache
- Dashboard cache written to localStorage after every SWR fetch
- Web app manifest in `app/manifest.ts`

## Security

- Supabase RLS policies are the primary security layer
- Always pass `userId` from server session — never trust client-provided user IDs
- Server actions get user from `createServerSupabaseClient().auth.getUser()`
- API routes do the same — never use client-provided user identity

## What NOT to do

- Don't add `console.log` to production code
- Don't mock Supabase in any capacity — use real DB for all testing
- Don't add `// TODO` or `// FIXME` — fix it now or create a ticket
- Don't create helper utilities for one-off use — three copies before abstracting
- Don't add backwards-compat shims — just change the code
- Don't speculate on future requirements — only implement what's asked
