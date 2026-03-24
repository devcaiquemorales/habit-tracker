import { redirect } from "next/navigation";

import { getHomeProfile } from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { CustomizationScreen } from "@/presentation/components/customization-screen";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getHomeProfile(supabase, user);

  return (
    <CustomizationScreen
      initialDisplayName={profile.displayName}
      initialMotivationPhrase={profile.motivationPhrase}
    />
  );
}
