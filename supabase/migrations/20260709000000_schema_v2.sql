-- ============================================================================
-- Schema v2 — habit-tracker (CLEAN SLATE)
-- Destructive: drops all app data and recreates the v2 schema from scratch.
-- Keeps auth.users (login). Re-runnable (drop if exists / create).
-- Run in the Supabase SQL Editor as a single script.
-- ============================================================================

begin;

-- ── 0. Drop everything we own (old schema, previous _old parking, v2 retries) ─
drop table if exists public.notification_deliveries    cascade;
drop table if exists public.notification_preferences   cascade;
drop table if exists public.push_subscriptions         cascade;
drop table if exists public.habit_logs                 cascade;
drop table if exists public.habit_fixed_days           cascade;
drop table if exists public.habits                     cascade;
drop table if exists public.profiles                   cascade;
drop table if exists public.habit_logs_old             cascade;
drop table if exists public.habit_fixed_days_old       cascade;
drop table if exists public.habits_old                 cascade;
drop table if exists public.profiles_old               cascade;

drop function if exists public.reorder_habits(uuid[])  cascade;
drop function if exists public.validate_log_date()     cascade;
drop function if exists public.handle_new_user()       cascade;
drop function if exists public.set_updated_at()        cascade;

drop type if exists public.schedule_type cascade;
drop type if exists public.color_variant cascade;

-- ── 1. Enums ────────────────────────────────────────────────────────────────
create type public.schedule_type as enum
  ('daily', 'specific_days', 'every_other_day', 'weekly_target', 'flexible');
create type public.color_variant as enum
  ('green', 'blue', 'amber', 'purple', 'red');

-- ── 2. updated_at helper ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── 3. profiles ─────────────────────────────────────────────────────────────
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text not null default '',
  motivation_phrase text,
  -- IANA timezone name (e.g. 'America/Sao_Paulo'). All "user local day"
  -- computations on the server derive from this column.
  timezone          text not null default 'UTC',
  locale            text not null default 'en' check (locale in ('en', 'pt')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Rejects invalid IANA names: 'at time zone' raises for unknown zones.
  constraint valid_timezone check ((now() at time zone timezone) is not null)
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill a profile for any user that already exists (kept from before).
insert into public.profiles (id, display_name, timezone, locale)
select u.id, coalesce(u.raw_user_meta_data ->> 'display_name', ''),
       'America/Sao_Paulo', 'pt'
from auth.users u
on conflict (id) do nothing;

-- ── 4. habits ───────────────────────────────────────────────────────────────
create table public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 80),
  color_variant public.color_variant not null default 'green',
  schedule_type public.schedule_type not null,
  weekly_target smallint check (weekly_target between 1 and 7),
  -- Weekdays 0 (Sun) … 6 (Sat); only for schedule_type = 'specific_days'.
  fixed_days    smallint[] check (fixed_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  -- Cycle anchor for 'every_other_day' (expected when (date - anchor) % 2 = 0).
  anchor_date   date not null default (now()::date),
  position      integer not null default 0,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint schedule_shape check (
    ((schedule_type = 'weekly_target') = (weekly_target is not null))
    and ((schedule_type = 'specific_days') = (fixed_days is not null))
    and (schedule_type <> 'specific_days' or array_length(fixed_days, 1) >= 1)
  )
);

create index habits_user_position_idx on public.habits (user_id, position);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- ── 5. habit_logs ───────────────────────────────────────────────────────────
-- log_date semantics: the USER'S LOCAL calendar day (profiles.timezone).
create table public.habit_logs (
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  log_date   date not null,
  created_at timestamptz not null default now(),
  primary key (habit_id, log_date)
);

create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date desc);

-- ── 6. push notifications ───────────────────────────────────────────────────
create table public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

create table public.notification_preferences (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  -- Local time of day in the user's timezone, snapped to 15-minute slots.
  reminder_time time not null check (extract(minute from reminder_time)::int % 15 = 0),
  enabled       boolean not null default true,
  -- 0–6 (Sun–Sat); null = every day.
  days_of_week  smallint[] check (days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  created_at    timestamptz not null default now(),
  unique (user_id, reminder_time)
);

create table public.notification_deliveries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  local_date    date not null,
  reminder_time time not null,
  sent_at       timestamptz not null default now(),
  done_count    smallint not null,
  pending_count smallint not null,
  unique (user_id, local_date, reminder_time)
);

-- ── 7. Atomic reorder ───────────────────────────────────────────────────────
create or replace function public.reorder_habits(p_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.habits h
  set position = u.ord - 1
  from unnest(p_ids) with ordinality as u (id, ord)
  where h.id = u.id
    and h.user_id = (select auth.uid());
$$;

grant execute on function public.reorder_habits(uuid[]) to authenticated;

-- ── 8. log_date validation ──────────────────────────────────────────────────
create or replace function public.validate_log_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  tz text;
begin
  select p.timezone into tz from public.profiles p where p.id = new.user_id;
  if new.log_date > (now() at time zone coalesce(tz, 'UTC'))::date then
    raise exception 'log_date % is in the future for the user timezone %',
      new.log_date, coalesce(tz, 'UTC');
  end if;
  return new;
end;
$$;

create trigger habit_logs_validate
  before insert or update on public.habit_logs
  for each row execute function public.validate_log_date();

-- ── 9. Row Level Security ───────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "own profile" on public.profiles
  for all using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "own habits" on public.habits
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Log rows must belong to the user AND point at the user's own habit.
create policy "own habit logs" on public.habit_logs
  for all using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

create policy "own push subscriptions" on public.push_subscriptions
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own notification preferences" on public.notification_preferences
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Deliveries: users may read their own; only the service role (dispatcher,
-- bypasses RLS) writes.
create policy "read own deliveries" on public.notification_deliveries
  for select using (user_id = (select auth.uid()));

commit;
