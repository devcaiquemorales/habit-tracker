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

export async function createHabitAction(input: {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
}): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
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
      error: e instanceof Error ? e.message : "Could not create habit.",
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
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
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
      error: e instanceof Error ? e.message : "Could not update habit.",
    };
  }
}

export async function deleteHabitAction(
  habitId: string,
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  try {
    await deleteHabitForUser(supabase, user.id, habitId);
    revalidatePath("/");
    revalidatePath(`/habits/${habitId}`);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not delete habit.",
    };
  }
}
