"use server";

import { revalidatePath } from "next/cache";

import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "@/domain/constants/profile-limits";
import { updateProfileCustomizationForUser } from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function updateProfileCustomizationAction(input: {
  displayName: string;
  motivationPhrase: string;
}): Promise<{ error: string | null }> {
  const displayName = input.displayName.trim();
  const motivationPhrase = input.motivationPhrase
    .trim()
    .slice(0, PROFILE_MOTIVATION_PHRASE_MAX);

  if (!displayName) {
    return { error: "Please enter a display name." };
  }
  if (displayName.length > PROFILE_DISPLAY_NAME_MAX) {
    return {
      error: `Display name must be at most ${PROFILE_DISPLAY_NAME_MAX} characters.`,
    };
  }
  if (!motivationPhrase) {
    return { error: "Please enter your reason." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  try {
    await updateProfileCustomizationForUser(supabase, user.id, {
      displayName,
      motivationPhrase,
    });
    revalidatePath("/");
    revalidatePath("/settings");
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not save your profile.",
    };
  }
}

export async function updateMotivationPhraseAction(
  phrase: string,
): Promise<{ error: string | null }> {
  const trimmed = phrase.trim().slice(0, PROFILE_MOTIVATION_PHRASE_MAX);
  if (!trimmed) {
    return { error: "Please enter your reason." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ motivation_phrase: trimmed })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return { error: null };
}
