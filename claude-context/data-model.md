# Data Model

## Database Tables (Supabase / PostgreSQL)

### `profiles`

Extends `auth.users` with display info.


| Column              | Type   | Notes                        |
| ------------------- | ------ | ---------------------------- |
| `id`                | string | PK — same as `auth.users.id` |
| `display_name`      | string | null                         |
| `motivation_phrase` | string | null                         |


Profile is upserted (not inserted) — created on first profile update. If no row exists, the code falls back to `user_metadata` from the auth user object.

---

### `habits`


| Column          | Type      | Notes                |
| --------------- | --------- | -------------------- |
| `id`            | string    | PK                   |
| `user_id`       | string    | FK → `auth.users.id` |
| `name`          | string    | Habit display name   |
| `color_variant` | string    | `"green"`            |
| `schedule_type` | enum      | `"fixed_days"`       |
| `weekly_target` | number    | null                 |
| `position`      | integer   | NOT NULL, 0-based dashboard sort order per user |
| `created_at`    | timestamp | Auto                 |


---

### `habit_fixed_days`

Junction table for `fixed_days` schedule.


| Column     | Type   | Notes                    |
| ---------- | ------ | ------------------------ |
| `habit_id` | string | FK → `habits.id`         |
| `weekday`  | number | 0 = Sunday, 6 = Saturday |


---

### `habit_logs`

Completion records — one per habit per day.


| Column     | Type   | Notes                          |
| ---------- | ------ | ------------------------------ |
| `id`       | string | PK                             |
| `habit_id` | string | FK → `habits.id`               |
| `user_id`  | string | FK → `auth.users.id`           |
| `log_date` | string | `"YYYY-MM-DD"` — stored as UTC |


Inserts are idempotent: the repository handles duplicate gracefully.

---

## Domain Types

Auto-generated DB types are at `infrastructure/supabase/database.types.ts`.
Domain models in `domain/types/` are the in-app representation.

### `Habit` (domain)

```typescript
interface Habit {
  id: string;
  name: string;
  colorVariant: "green" | "blue" | "amber" | "purple";
  schedule: Schedule;
  streak: number;
  completedToday: boolean;
}
```

### `Schedule` (domain)

```typescript
type Schedule =
  | { type: "daily" }
  | { type: "specificDays"; days: number[] }   // days: 0–6 weekday numbers
  | { type: "everyOtherDay" }
  | { type: "flexible" }
  | { type: "weeklyTarget"; timesPerWeek: number };
```

**DB → Domain mapping** (in `habit-db-mapper.ts`):

- `"fixed_days"` with days array → `"specificDays"` or `"daily"` (if all 7 days selected)
- `"every_other_day"` → `"everyOtherDay"`
- `"flexible"` → `"flexible"`
- `"weekly_target"` → `"weeklyTarget"`

### `HeatmapData` (domain)

```typescript
interface HeatmapDayCell {
  date: Date | null;
  done: number;       // 0 = not done, 1 = done
  trailing?: boolean; // Padding cell after month end
}

interface HeatmapMonthData {
  id: string;            // e.g. "2025-04"
  label: string;         // e.g. "April" or "April 2025"
  weeks: HeatmapDayCell[][];  // Each week has 7 cells (Sun–Sat)
}

interface HeatmapData {
  months: HeatmapMonthData[];
  rangeStart: Date;   // First day of 12-month window
  rangeEnd: Date;     // Last day of current month
  today: Date;
}
```

### `UserProfile` (domain)

```typescript
interface UserProfile {
  displayName: string;
  motivationPhrase: string;
}
```

---

## Date Keys

Two parallel systems, both format as `"YYYY-MM-DD"`:


| System    | Functions                                                       | Usage                   |
| --------- | --------------------------------------------------------------- | ----------------------- |
| **UTC**   | `toUtcDateKey()`, `utcDateFromDateKey()`, `getUtcToday()`       | Server-side, DB storage |
| **Local** | `toLocalDateKey()`, `localDateFromDateKey()`, `getLocalToday()` | Client-side, UI display |


All `log_date` values in the DB are UTC. The client converts to local timezone for display.

---

## DashboardJson (API payload shape)

Returned by `GET /api/dashboard`:

```typescript
interface DashboardJson {
  profile: { displayName: string; motivationPhrase: string };
  habits: Array<{
    id: string;
    name: string;
    colorVariant: string;
    schedule: Schedule;
    completedDateKeys: string[];   // all log_date values for this habit
  }>;
}
```

Client builds streaks and heatmaps from `completedDateKeys` on the client side.