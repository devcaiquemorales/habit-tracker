import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/infrastructure/supabase/database.types";

export async function listLogDateKeysForUserHabits(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitIds: string[],
): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  if (habitIds.length === 0) return map;

  const { data, error } = await supabase
    .from("habit_logs")
    .select("habit_id, log_date")
    .eq("user_id", userId)
    .in("habit_id", habitIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const set = map.get(row.habit_id) ?? new Set<string>();
    set.add(row.log_date);
    map.set(row.habit_id, set);
  }

  return map;
}

export async function listLogDateKeysForHabit(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("log_date")
    .eq("user_id", userId)
    .eq("habit_id", habitId);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.log_date));
}

export async function insertHabitLog(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
  loggedDate: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("habit_logs").insert({
    habit_id: habitId,
    user_id: userId,
    log_date: loggedDate,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: null };
    }
    return { error: error.message };
  }
  return { error: null };
}

export async function deleteHabitLog(
  supabase: SupabaseClient<Database>,
  userId: string,
  habitId: string,
  loggedDate: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("log_date", loggedDate);

  if (error) return { error: error.message };
  return { error: null };
}
