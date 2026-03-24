"use server";

import { revalidatePath } from "next/cache";

import {
  deleteHabitLog,
  insertHabitLog,
} from "@/infrastructure/repositories/habit-log-repository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

export async function logHabitDayAction(
  habitId: string,
  loggedDate: string,
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
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
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  const result = await deleteHabitLog(supabase, user.id, habitId, loggedDate);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  return { error: null };
}
