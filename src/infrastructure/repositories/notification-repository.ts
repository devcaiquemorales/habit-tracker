import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/infrastructure/supabase/database.types";

type NotificationPreferenceRow =
  Database["public"]["Tables"]["notification_preferences"]["Row"];
type PushSubscriptionRow =
  Database["public"]["Tables"]["push_subscriptions"]["Row"];

export async function listReminderPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<NotificationPreferenceRow[]> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .order("reminder_time", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as NotificationPreferenceRow[];
}

export async function upsertReminderPreference(
  supabase: SupabaseClient<Database>,
  userId: string,
  reminderTime: string,
  enabled: boolean,
): Promise<NotificationPreferenceRow> {
  // Snap minutes to 15-minute intervals (floor)
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const snappedMinutes = Math.floor(minutes / 15) * 15;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(snappedMinutes).padStart(2, "0")}:00`;

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: userId,
        reminder_time: formattedTime,
        enabled,
      },
      {
        onConflict: "user_id,reminder_time",
      },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NotificationPreferenceRow;
}

export async function deleteReminderPreference(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("notification_preferences")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function setReminderEnabled(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("notification_preferences")
    .update({ enabled })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function savePushSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  sub: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
  },
): Promise<PushSubscriptionRow> {
  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        user_agent: sub.userAgent,
      },
      {
        onConflict: "endpoint",
      },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PushSubscriptionRow;
}

export async function deletePushSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  endpoint: string,
): Promise<void> {
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);

  if (error) throw new Error(error.message);
}
