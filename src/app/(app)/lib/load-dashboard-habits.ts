import { addDaysToDateKey,todayKeyInTimeZone } from "@/domain/types/date-key";
import {
  getHabitByIdForUser,
  getUserTimezone,
  listLogDateKeysForHabit,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function loadHabitDetail(habitId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { habit: null, completedKeys: new Set<string>() };
  }

  const timezone = await getUserTimezone(supabase, user.id);
  const todayKey = todayKeyInTimeZone(timezone);
  const sinceKey = addDaysToDateKey(todayKey, -400);

  const completedKeys = await listLogDateKeysForHabit(
    supabase,
    user.id,
    habitId,
    sinceKey,
  );

  const habit = await getHabitByIdForUser(
    supabase,
    user.id,
    habitId,
    completedKeys,
    todayKey,
  );

  return { habit, completedKeys };
}
