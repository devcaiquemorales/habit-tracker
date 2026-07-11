"use server";

import { revalidatePath } from "next/cache";

import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import {
  deleteHabitForUser,
  insertHabit,
  reorderHabitsForUser,
  updateHabitForUser,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

function validateHabitInput(input: {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
}): boolean {
  const trimmed = input.name.trim();
  if (trimmed.length < 1 || trimmed.length > 80) {
    return false;
  }

  if (input.schedule.type === "specificDays") {
    const days = input.schedule.days;
    if (!Array.isArray(days) || days.length === 0) {
      return false;
    }
    const unique = new Set(days);
    for (const d of unique) {
      if (typeof d !== "number" || d < 0 || d > 6) {
        return false;
      }
    }
  } else if (input.schedule.type === "weeklyTarget") {
    const times = input.schedule.timesPerWeek;
    if (typeof times !== "number" || times < 1 || times > 7) {
      return false;
    }
  } else if (input.schedule.type === "everyOtherDay") {
    if (input.schedule.anchorDateKey) {
      const match = /^\d{4}-\d{2}-\d{2}$/.exec(input.schedule.anchorDateKey);
      if (!match) {
        return false;
      }
    }
  }

  return true;
}

export async function createHabitAction(input: {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
}): Promise<LocalizedActionResult> {
  if (!validateHabitInput(input)) {
    return { error: null, errorKey: "errors.invalidInput" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await insertHabit(supabase, user.id, {
      name: input.name.trim(),
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
  if (!validateHabitInput(input)) {
    return { error: null, errorKey: "errors.invalidInput" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await updateHabitForUser(supabase, user.id, habitId, {
      name: input.name.trim(),
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

export async function reorderHabitsAction(
  orderedIds: string[],
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await reorderHabitsForUser(supabase, user.id, orderedIds);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.reorderHabitsFailed",
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
