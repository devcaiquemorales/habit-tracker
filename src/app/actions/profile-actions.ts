"use server";

import { revalidatePath } from "next/cache";

import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "@/domain/constants/profile-limits";
import { updateProfileCustomizationForUser } from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

export async function updateProfileCustomizationAction(input: {
  displayName: string;
  motivationPhrase: string;
}): Promise<LocalizedActionResult> {
  const displayName = input.displayName.trim();
  const motivationPhrase = input.motivationPhrase
    .trim()
    .slice(0, PROFILE_MOTIVATION_PHRASE_MAX);

  if (!displayName) {
    return { error: null, errorKey: "errors.enterDisplayName" };
  }
  if (displayName.length > PROFILE_DISPLAY_NAME_MAX) {
    return {
      error: null,
      errorKey: "errors.displayNameMax",
      errorParams: { max: PROFILE_DISPLAY_NAME_MAX },
    };
  }
  if (!motivationPhrase) {
    return { error: null, errorKey: "errors.enterReason" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
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
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.saveProfileFailed",
    };
  }
}

export async function updateMotivationPhraseAction(
  phrase: string,
): Promise<LocalizedActionResult> {
  const trimmed = phrase.trim().slice(0, PROFILE_MOTIVATION_PHRASE_MAX);
  if (!trimmed) {
    return { error: null, errorKey: "errors.enterReason" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
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
