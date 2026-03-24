# Expected Supabase schema (frontend integration)

The TypeScript types in `database.types.ts` assume the following. **Align your project or regenerate types** (`bun run supabase:types`) if names differ.

## Tables

### `habits`

- `id` (uuid, PK)
- `user_id` (uuid, FK → `auth.users`)
- `name` (text)
- `color_variant` (text) — one of: `green`, `blue`, `amber`, `purple`
- `schedule_type` — `fixed_days` | `weekly_target` | `flexible` | `every_other_day`
- `weekly_target` (int, nullable) — set for `weekly_target`; `null` for others
- `created_at` (timestamptz)

### `habit_fixed_days`

- `habit_id` (uuid, FK → `habits`)
- `weekday` (smallint, 0–6, UTC weekday like `Date.getUTCDay()`)
- Primary key `(habit_id, weekday)` (recommended)

Used when `schedule_type = fixed_days`. For “daily” in the app, all seven days are stored.

### `habit_logs`

- `id` (uuid, PK)
- `habit_id` (uuid, FK → `habits`)
- `user_id` (uuid, FK → `auth.users`)
- `log_date` (date) — calendar day in UTC as `YYYY-MM-DD`
- **Unique** `(habit_id, log_date)` for idempotent logging

### `profiles`

Already used by auth (see existing setup).

## Optional: `every_other_day`

If your `schedule_type` enum does not include `every_other_day`, add it in SQL or map that UI option differently.

```sql
-- Example (adjust enum name to match your DB)
ALTER TYPE habit_schedule_type ADD VALUE IF NOT EXISTS 'every_other_day';
```

## PostgREST

Ensure a foreign key from `habit_fixed_days.habit_id` → `habits.id` so `.select('*, habit_fixed_days(weekday)')` works.
