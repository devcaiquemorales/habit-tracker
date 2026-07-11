import { redirect } from "next/navigation";

import {
  getHomeProfile,
  listReminderPreferences,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { CustomizationScreen } from "@/presentation/components/customization-screen";
import { NotificationSettings } from "@/presentation/components/notification-settings";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getHomeProfile(supabase, user);
  const reminders = await listReminderPreferences(supabase, user.id);

  const reminderPreferences = reminders.map((r) => ({
    id: r.id,
    reminderTime: r.reminder_time.slice(0, 5), // Convert "HH:MM:00" to "HH:MM"
    enabled: r.enabled,
  }));

  return (
    <CustomizationScreen
      initialDisplayName={profile.displayName}
      initialMotivationPhrase={profile.motivationPhrase}
      userEmail={user.email}
    >
      <NotificationSettings initialPreferences={reminderPreferences} />
    </CustomizationScreen>
  );
}
