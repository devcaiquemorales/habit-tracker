import { NextResponse } from "next/server";

import { listReminderPreferences } from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const reminders = await listReminderPreferences(supabase, user.id);

    const reminderPreferences = reminders.map((r) => ({
      id: r.id,
      reminderTime: r.reminder_time.slice(0, 5), // Convert "HH:MM:00" to "HH:MM"
      enabled: r.enabled,
    }));

    return NextResponse.json(reminderPreferences);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
