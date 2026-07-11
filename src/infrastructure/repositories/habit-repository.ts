import type { SupabaseClient } from "@supabase/supabase-js";

import { computeStreak } from "@/domain/lib/compute-streak";
import { addDaysToDateKey } from "@/domain/types/date-key";
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

/** Fetch window for logs: covers the 12-month heatmap and the streak walk. */
const LOG_WINDOW_DAYS = 400;

function mapRowToHabit(
  row: HabitRow,
  completedDateKeys: ReadonlySet<string>,
  todayKey: string,
): Habit {
  const schedule = scheduleFromDb(
    row.schedule_type,
    row.weekly_target,
    row.fixed_days,
    row.anchor_date,
  );
  return {
    id: row.id,
    name: row.name,
    colorVariant: parseColorVariant(row.color_variant),
    schedule,
    streak: computeStreak(completedDateKeys, schedule, todayKey).count,
    completedToday: completedDateKeys.has(todayKey),
    position: row.position,
  };
}

export async function listHabitsWithLogsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  todayKey: string,
): Promise<{
  habits: Habit[];
  logKeysByHabitId: Map<string, Set<string>>;
}> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as HabitRow[];
  const habitIds = rows.map((r) => r.id);
  const logKeysByHabitId = await listLogDateKeysForUserHabits(
    supabase,
    userId,
    habitIds,
    addDaysToDateKey(todayKey, -LOG_WINDOW_DAYS),
  );

  const habits = rows.map((row) =>
    mapRowToHabit(row, logKeysByHabitId.get(row.id) ?? new Set(), todayKey),
  );

  return { habits, logKeysByHabitId };
}

export async function getHabitByIdForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
  completedDateKeys: ReadonlySet<string>,
  todayKey: string,
): Promise<Habit | null> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("id", habitId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRowToHabit(data as HabitRow, completedDateKeys, todayKey);
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
  const payload = scheduleToDbPayload(input.schedule);

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

  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    name: input.name,
    color_variant: input.color_variant,
    schedule_type: payload.schedule_type,
    weekly_target: payload.weekly_target,
    fixed_days: payload.fixed_days,
    position: nextPosition,
  };

  if (payload.anchor_date !== undefined) {
    insertPayload.anchor_date = payload.anchor_date;
  }

  const typedInsertPayload = insertPayload as Database["public"]["Tables"]["habits"]["Insert"];

  const { data: row, error } = await supabase
    .from("habits")
    .insert(typedInsertPayload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: row.id };
}

export async function reorderHabitsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  orderedIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc("reorder_habits", {
    p_ids: orderedIds,
  });

  if (error) throw new Error(error.message);
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

  const updatePayload: Record<string, unknown> = {
    name: input.name,
    color_variant: input.color_variant,
    schedule_type: payload.schedule_type,
    weekly_target: payload.weekly_target,
    fixed_days: payload.fixed_days,
  };

  if (payload.anchor_date !== undefined) {
    updatePayload.anchor_date = payload.anchor_date;
  }

  const typedUpdatePayload = updatePayload as Database["public"]["Tables"]["habits"]["Update"];

  const { error } = await supabase
    .from("habits")
    .update(typedUpdatePayload)
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

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

  const { error: delError } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);

  if (delError) throw new Error(delError.message);
}
