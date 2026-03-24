import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/infrastructure/supabase/database.types";

export type HomeProfileResolved = {
  displayName: string;
  motivationPhrase: string;
};

/**
 * Loads greeting inputs from `profiles` with fallbacks to `user_metadata` from signup.
 */
export async function getHomeProfile(
  supabase: SupabaseClient<Database>,
  user: { id: string; email?: string | null; user_metadata?: unknown },
): Promise<HomeProfileResolved> {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaName =
    typeof meta?.display_name === "string" ? meta.display_name.trim() : "";
  const metaMotivation =
    typeof meta?.motivation_phrase === "string"
      ? meta.motivation_phrase.trim()
      : "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, motivation_phrase")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name?.trim() ||
    metaName ||
    user.email?.split("@")[0]?.trim() ||
    "there";

  const motivationPhrase =
    profile?.motivation_phrase?.trim() || metaMotivation || "";

  return { displayName, motivationPhrase };
}
