"use server";

import { revalidatePath } from "next/cache";

import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import {
  deleteHabitForUser,
  insertHabit,
  updateHabitForUser,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

export async function createHabitAction(input: {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
}): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await insertHabit(supabase, user.id, {
      name: input.name,
      color_variant: input.colorVariant,
      schedule: input.schedule,
    });
    revalidatePath("/");
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.createHabitFailed",
    };
  }
}

export async function updateHabitAction(
  habitId: string,
  input: {
    name: string;
    colorVariant: ColorVariant;
    schedule: Schedule;
  },
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await updateHabitForUser(supabase, user.id, habitId, {
      name: input.name,
      color_variant: input.colorVariant,
      schedule: input.schedule,
    });
    revalidatePath("/");
    revalidatePath(`/habits/${habitId}`);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.updateHabitFailed",
    };
  }
}

export async function deleteHabitAction(
  habitId: string,
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await deleteHabitForUser(supabase, user.id, habitId);
    revalidatePath("/");
    revalidatePath(`/habits/${habitId}`);
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Habit not found")) {
      return { error: msg, errorKey: "errors.habitNotFound" };
    }
    return {
      error: msg,
      errorKey: "errors.deleteHabitFailed",
    };
  }
}
