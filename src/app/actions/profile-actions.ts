"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function updateMotivationPhraseAction(
  phrase: string,
): Promise<{ error: string | null }> {
  const trimmed = phrase.trim();
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
  return { error: null };
}
