# Schema v2 (2026-07-09)

The schema is managed via Supabase migrations. TypeScript types are auto-generated from the live DB.

## Migration

Migration file: `supabase/migrations/20260709000000_schema_v2.sql`

After applying:
```bash
bun supabase:types
```

## Key changes from v1

- `habits` table now includes `schedule_type`, `weekly_target`, `fixed_days`, `anchor_date`, `position`, `archived_at` columns
- `habit_fixed_days` table removed (schedule data is denormalized into `habits`)
- `habit_logs` composite PK: `(habit_id, log_date)` with no separate `id` column
- `profiles` table gains `timezone` (IANA name, defaults UTC) and `locale` (enum: 'en' | 'pt')
- New tables: `push_subscriptions`, `notification_preferences`, `notification_deliveries`
- New function: `reorder_habits(p_ids uuid[])` for atomic habit reordering
