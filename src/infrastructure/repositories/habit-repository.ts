import type { SupabaseClient } from "@supabase/supabase-js";

import { computeHabitStreak } from "@/domain/lib/compute-habit-streak";
import { getUtcToday, toUtcDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import {
  parseColorVariant,
  scheduleFromDb,
  scheduleToDbPayload,
} from "@/infrastructure/mappers/habit-db-mapper";
import type { Database } from "@/infrastructure/supabase/database.types";

import { listLogDateKeysForUserHabits } from "./habit-log-repository";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type FixedDayRow = { weekday: number };

export type HabitWithScheduleRows = HabitRow & {
  habit_fixed_days: FixedDayRow[] | null;
};

function mapRowToHabit(
  row: HabitWithScheduleRows,
  completedDateKeys: ReadonlySet<string>,
): Habit {
  const fixed =
    row.habit_fixed_days
      ?.map((r) => r.weekday)
      .filter((d) => d >= 0 && d <= 6) ?? [];
  const schedule = scheduleFromDb(row.schedule_type, row.weekly_target, fixed);
  const todayKey = toUtcDateKey(getUtcToday());
  return {
    id: row.id,
    name: row.name,
    colorVariant: parseColorVariant(row.color_variant),
    schedule,
    streak: computeHabitStreak(completedDateKeys, getUtcToday()),
    completedToday: completedDateKeys.has(todayKey),
    position: row.position,
  };
}

export async function listHabitsWithLogsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{
  habits: Habit[];
  logKeysByHabitId: Map<string, Set<string>>;
}> {
  const { data, error } = await supabase
    .from("habits")
    .select("*, habit_fixed_days(weekday)")
    .eq("user_id", userId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as HabitWithScheduleRows[];
  const habitIds = rows.map((r) => r.id);
  const logKeysByHabitId = await listLogDateKeysForUserHabits(
    supabase,
    userId,
    habitIds,
  );

  const habits = rows.map((row) =>
    mapRowToHabit(row, logKeysByHabitId.get(row.id) ?? new Set()),
  );

  return { habits, logKeysByHabitId };
}

export async function getHabitByIdForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
  completedDateKeys: ReadonlySet<string>,
): Promise<Habit | null> {
  const { data, error } = await supabase
    .from("habits")
    .select("*, habit_fixed_days(weekday)")
    .eq("user_id", userId)
    .eq("id", habitId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRowToHabit(data as HabitWithScheduleRows, completedDateKeys);
}

export async function insertHabit(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    name: string;
    color_variant: string;
    schedule: Schedule;
  },
): Promise<{ id: string }> {
  const { schedule_type, weekly_target, fixed_days } = scheduleToDbPayload(
    input.schedule,
  );

  const { data: maxRow, error: maxError } = await supabase
    .from("habits")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) throw new Error(maxError.message);
  const nextPosition =
    maxRow?.position !== undefined && maxRow.position !== null
      ? maxRow.position + 1
      : 0;

  const { data: row, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      name: input.name,
      color_variant: input.color_variant,
      schedule_type,
      weekly_target,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  const habitId = row.id;

  if (fixed_days !== null && fixed_days.length > 0) {
    const { error: fdError } = await supabase.from("habit_fixed_days").insert(
      fixed_days.map((weekday) => ({
        habit_id: habitId,
        weekday,
      })),
    );
    if (fdError) throw new Error(fdError.message);
  }

  return { id: habitId };
}

export async function reorderHabitsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  orderedIds: string[],
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("habits")
      .update({ position: i })
      .eq("id", orderedIds[i])
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

async function normalizeHabitPositionsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data: rows, error } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", userId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const list = rows ?? [];
  for (let i = 0; i < list.length; i++) {
    const { error: upError } = await supabase
      .from("habits")
      .update({ position: i })
      .eq("id", list[i].id)
      .eq("user_id", userId);
    if (upError) throw new Error(upError.message);
  }
}

export async function updateHabitForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
  input: {
    name: string;
    color_variant: string;
    schedule: Schedule;
  },
): Promise<void> {
  const payload = scheduleToDbPayload(input.schedule);

  const { error: upError } = await supabase
    .from("habits")
    .update({
      name: input.name,
      color_variant: input.color_variant,
      schedule_type: payload.schedule_type,
      weekly_target: payload.weekly_target,
    })
    .eq("id", habitId)
    .eq("user_id", userId);

  if (upError) throw new Error(upError.message);

  const { error: delError } = await supabase
    .from("habit_fixed_days")
    .delete()
    .eq("habit_id", habitId);

  if (delError) throw new Error(delError.message);

  if (payload.fixed_days !== null && payload.fixed_days.length > 0) {
    const { error: insError } = await supabase.from("habit_fixed_days").insert(
      payload.fixed_days.map((weekday) => ({
        habit_id: habitId,
        weekday,
      })),
    );
    if (insError) throw new Error(insError.message);
  }
}

/**
 * Removes logs and schedule rows, then the habit. Safe when FKs have no cascade.
 */
export async function deleteHabitForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
): Promise<void> {
  const { data: row, error: selError } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selError) throw new Error(selError.message);
  if (!row) {
    throw new Error("Habit not found.");
  }

  const { error: logError } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId);

  if (logError) throw new Error(logError.message);

  const { error: fdError } = await supabase
    .from("habit_fixed_days")
    .delete()
    .eq("habit_id", habitId);

  if (fdError) throw new Error(fdError.message);

  const { error: delError } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);

  if (delError) throw new Error(delError.message);

  await normalizeHabitPositionsForUser(supabase, userId);
}
