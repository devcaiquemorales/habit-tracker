import {
  getHabitByIdForUser,
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

  const completedKeys = await listLogDateKeysForHabit(
    supabase,
    user.id,
    habitId,
  );

  const habit = await getHabitByIdForUser(
    supabase,
    user.id,
    habitId,
    completedKeys,
  );

  return { habit, completedKeys };
}
