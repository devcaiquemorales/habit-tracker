"use server";

import { revalidatePath } from "next/cache";

import {
  deleteHabitLog,
  insertHabitLog,
} from "@/infrastructure/repositories/habit-log-repository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function logHabitDayAction(
  habitId: string,
  loggedDate: string,
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  const result = await insertHabitLog(supabase, user.id, habitId, loggedDate);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  return { error: null };
}

export async function unlogHabitDayAction(
  habitId: string,
  loggedDate: string,
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  const result = await deleteHabitLog(supabase, user.id, habitId, loggedDate);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  return { error: null };
}
