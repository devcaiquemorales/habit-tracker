"use server";

import { revalidatePath } from "next/cache";

import { todayKeyInTimeZone } from "@/domain/types/date-key";
import { getUserTimezone } from "@/infrastructure/repositories";
import {
  deleteHabitLog,
  insertHabitLog,
} from "@/infrastructure/repositories/habit-log-repository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

function validateDateKey(dateKey: string): boolean {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(dateKey);
  if (!match) return false;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export async function logHabitDayAction(
  habitId: string,
  loggedDate: string,
): Promise<LocalizedActionResult> {
  if (!validateDateKey(loggedDate)) {
    return { error: null, errorKey: "errors.invalidDate" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  const userTz = await getUserTimezone(supabase, user.id);
  const todayKey = todayKeyInTimeZone(userTz || "UTC");
  if (loggedDate > todayKey) {
    return { error: null, errorKey: "errors.invalidDate" };
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
  if (!validateDateKey(loggedDate)) {
    return { error: null, errorKey: "errors.invalidDate" };
  }

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
