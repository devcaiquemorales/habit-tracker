# Data Flow

## Dashboard Load

```
1. app/(app)/page.tsx renders (SSR — no data, just shell)
2. HomeDashboardClient mounts on client
3. useEffect: reads localStorage cache → mutate SWR with cached data (instant render)
4. SWR fetches GET /api/dashboard (with session cookie)
5. API route: calls getDashboardPayload()
   → createServerSupabaseClient()
   → listHabitsWithLogsForUser(supabase, userId)
   → getHomeProfile(supabase, user)
6. Returns DashboardJson { profile, habits[] with completedDateKeys }
7. Client builds streaks + heatmaps from completedDateKeys
8. SWR updates cache, writes to localStorage for offline
```

Key files:

- `app/(app)/page.tsx` — SSR shell
- `app/api/dashboard/route.ts` — data endpoint
- `presentation/components/home-dashboard-client/` — SWR + rendering
- `presentation/lib/dashboard-swr.ts` — SWR config + mutation helpers
- `presentation/lib/dashboard-cache.ts` — localStorage cache

---

## Logging a Habit (Heatmap Cell Click)

```
1. User taps a heatmap cell
2. patchDashboardAfterLogMutation(habitId, dateKey, "add") — optimistic UI update
3. logHabitDayAction(habitId, loggedDate) — server action
4. insertHabitLog(supabase, userId, habitId, loggedDate) — repository
5. Supabase: INSERT INTO habit_logs (idempotent)
6. revalidatePath("/") + revalidatePath("/habits/[id]")
7. SWR revalidates in background
```

For unlogging: same flow but `"remove"` and `unlogHabitDayAction` → `deleteHabitLog`.

Key files:

- `app/actions/habit-log-actions.ts`
- `infrastructure/repositories/habit-log-repository.ts`
- `presentation/lib/dashboard-swr.ts` — `patchDashboardAfterLogMutation()`

---

## Creating a Habit

```
1. User fills HabitFormDialog (name, color, schedule)
2. createHabitAction(input) — server action
3. scheduleToDbPayload(schedule) — mapper converts domain → DB columns
4. insertHabit(supabase, userId, input) — repository
5. Supabase: INSERT habits + INSERT habit_fixed_days (if specificDays)
6. revalidatePath("/")
7. SWR revalidates dashboard
```

Key files:

- `app/actions/habit-actions.ts`
- `infrastructure/repositories/habit-repository.ts`
- `infrastructure/mappers/habit-db-mapper.ts`

---

## Editing a Habit

```
1. updateHabitAction(habitId, input) — server action
2. patchDashboardHabit(habitId, update) — optimistic UI
3. updateHabitForUser(supabase, userId, habitId, input) — repository
4. Supabase: UPDATE habits + DELETE habit_fixed_days + INSERT new fixed_days
5. revalidatePath("/") + revalidatePath("/habits/[id]")
```

---

## Deleting a Habit

```
1. deleteHabitAction(habitId)
2. removeHabitFromDashboard(habitId) — optimistic UI
3. deleteHabitForUser(supabase, userId, habitId)
4. Supabase: DELETE habit_logs → DELETE habit_fixed_days → DELETE habit (cascade order)
5. revalidatePath("/")
```

---

## Authentication Flow

```
Sign Up:
  SignupForm → Supabase Auth → email confirmation → session cookie

Sign In:
  LoginForm → Supabase Auth → session cookie
  
Session Refresh:
  Every request → middleware.ts → updateSession() refreshes Supabase cookie

Route Protection:
  app/(app)/layout.tsx → createServerSupabaseClient().auth.getUser()
  → no user → redirect("/login")

Sign Out:
  signOutAction() → supabase.auth.signOut() → redirect("/login")

Password Reset:
  ForgotPasswordForm → Supabase sends email link
  → /auth/callback → /update-password
  → UpdatePasswordForm → supabase.auth.updateUser()
```

---

## Habit Order (Drag & Drop)

**Source of truth:** `habits.position` in PostgreSQL (integer, 0-based per user). The repository lists habits with `ORDER BY position ASC`; new habits get `max(position) + 1`; delete re-normalizes positions to close gaps.

```
1. HomeDashboardClient renders habits ordered by use-habit-order
2. useHabitOrder seeds order from the SWR `habits` array (already sorted by position)
3. On drag end: optimistic reorder in React state, then `reorderHabitsAction(orderedIds)` (server action → repository updates each row’s position)
4. After optimistic reorder: `writeDashboardCache` updates the dashboard `localStorage` snapshot so back navigation does not flicker with stale order
5. On action failure: local order and dashboard cache revert to the pre-drag order
6. On SWR refresh: when the habit id sequence from the server changes, local order syncs from props (add/remove / cross-device reorder)
```

The legacy `habit-order-v1` localStorage key is unused.

Key files: `presentation/hooks/use-habit-order.ts`, `app/actions/habit-actions.ts` (`reorderHabitsAction`), `infrastructure/repositories/habit-repository.ts`

---

## State Management Summary


| State            | Where                                        |
| ---------------- | -------------------------------------------- |
| Server truth     | Supabase (PostgreSQL)                        |
| Fetched + cached | SWR (`/api/dashboard` + `revalidatePath`)    |
| Offline cache    | `localStorage` via `dashboard-cache.ts`      |
| Habit order      | Supabase `habits.position`; dashboard cache updated on reorder via `use-habit-order.ts` |
| UI state         | React `useState` (modals, form values, etc.) |
| Auth session     | Supabase cookie (managed by middleware)      |


