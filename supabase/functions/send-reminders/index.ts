import webpush from "npm:web-push";
import { createClient } from "npm:@supabase/supabase-js@2";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Parse local date/time in timezone. Returns YYYY-MM-DD, hour, minute, weekday (0=Sun). */
function localPartsFor(
  timezone: string,
  date: Date
): {
  localDate: string;
  localHour: number;
  localMinute: number;
  localWeekday: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const partMap = Object.fromEntries(
    parts.map((p) => [p.type, p.value])
  ) as Record<string, string>;

  const localDate = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const localHour = parseInt(partMap.hour, 10);
  const localMinute = parseInt(partMap.minute, 10);

  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const localWeekday = weekdays[partMap.weekday] ?? 0;

  return { localDate, localHour, localMinute, localWeekday };
}

/** Parse date string to epoch days. UTC math so the runtime timezone is irrelevant. */
function parseDateKeyToEpochDay(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

/** Get Sunday of the week containing a date (YYYY-MM-DD). UTC math. */
function weekStart(dateStr: string): string {
  const epochDay = parseDateKeyToEpochDay(dateStr);
  const dayOfWeek = new Date(epochDay * 86400000).getUTCDay();
  return new Date((epochDay - dayOfWeek) * 86400000).toISOString().split("T")[0];
}

/** Check if habit is expected on localDate. */
function isHabitExpectedToday(
  habit: {
    schedule_type: string;
    fixed_days?: number[] | null;
    weekly_target?: number | null;
    anchor_date: string;
  },
  localDate: string,
  localWeekday: number
): boolean {
  if (habit.schedule_type === "daily") return true;

  if (habit.schedule_type === "specific_days") {
    return (habit.fixed_days || []).includes(localWeekday);
  }

  if (habit.schedule_type === "every_other_day") {
    const localEpoch = parseDateKeyToEpochDay(localDate);
    const anchorEpoch = parseDateKeyToEpochDay(habit.anchor_date);
    const diff = localEpoch - anchorEpoch;
    return diff >= 0 && diff % 2 === 0;
  }

  if (habit.schedule_type === "weekly_target") {
    return true;
  }

  return false;
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  try {
    // Authorization check
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Setup webpush VAPID
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject =
      Deno.env.get("VAPID_SUBJECT") ||
      "mailto:developer.caiquemorales@gmail.com";

    if (!vapidPublic || !vapidPrivate) {
      throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY not configured");
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    // Supabase client (service role bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    // Fetch enabled preferences
    const { data: prefs, error: prefError } = await client
      .from("notification_preferences")
      .select("*")
      .eq("enabled", true);

    if (prefError) throw prefError;

    // Fetch profiles (timezone, locale)
    const userIds = [...new Set((prefs || []).map((p) => p.user_id))];
    let profiles: Array<{ id: string; timezone: string; locale: string }> = [];

    if (userIds.length > 0) {
      const { data, error } = await client
        .from("profiles")
        .select("id, timezone, locale")
        .in("id", userIds);

      if (error) throw error;
      profiles = data || [];
    }

    const profileMap = Object.fromEntries(
      profiles.map((p) => [p.id, p])
    );

    let checked = 0;
    let matched = 0;
    let sent = 0;
    let cleaned = 0;

    // Process each preference
    for (const pref of prefs || []) {
      checked++;

      const profile = profileMap[pref.user_id];
      if (!profile) {
        console.warn(
          `No profile found for user_id ${pref.user_id}, skipping`
        );
        continue;
      }

      // Get local time parts
      const { localDate, localHour, localMinute, localWeekday } = localPartsFor(
        profile.timezone,
        now
      );

      // Parse reminder_time (HH:MM:SS format)
      const [remHour, remMinute] = pref.reminder_time
        .split(":")
        .slice(0, 2)
        .map(Number);

      // Check if current minute's 15-minute slot matches reminder slot
      const currentSlot = Math.floor(localMinute / 15) * 15;
      const reminderSlot = Math.floor(remMinute / 15) * 15;

      if (localHour !== remHour || currentSlot !== reminderSlot) {
        continue;
      }

      // Check days_of_week (null = every day)
      if (
        pref.days_of_week &&
        pref.days_of_week.length > 0 &&
        !pref.days_of_week.includes(localWeekday)
      ) {
        continue;
      }

      matched++;

      // Deduplication: check if notification already sent today
      const { count: existingCount } = await client
        .from("notification_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", pref.user_id)
        .eq("local_date", localDate)
        .eq("reminder_time", pref.reminder_time);

      if ((existingCount ?? 0) > 0) {
        continue;
      }

      // Fetch habits and logs
      const { data: habits, error: habitsError } = await client
        .from("habits")
        .select("*")
        .eq("user_id", pref.user_id)
        .is("archived_at", null);

      if (habitsError) throw habitsError;

      if (!habits || habits.length === 0) continue;

      // Fetch logs (last 7 days for weekly_target context)
      const sevenDaysAgo = new Date(
        new Date(localDate).getTime() - 7 * 24 * 60 * 60 * 1000
      );
      const logDateStart = sevenDaysAgo.toISOString().split("T")[0];

      const { data: logs, error: logsError } = await client
        .from("habit_logs")
        .select("habit_id, log_date")
        .eq("user_id", pref.user_id)
        .gte("log_date", logDateStart)
        .lte("log_date", localDate);

      if (logsError) throw logsError;

      // Compute habit progress
      const expected = habits.filter((h) =>
        isHabitExpectedToday(h, localDate, localWeekday)
      );

      if (expected.length === 0) continue;

      let done = 0;
      const pendingNames: string[] = [];

      for (const habit of expected) {
        let isDone = false;

        if (habit.schedule_type === "weekly_target") {
          // Check if week's target is met
          const wkStart = weekStart(localDate);
          const weekLogs = (logs || []).filter(
            (l) => l.habit_id === habit.id && l.log_date >= wkStart
          );
          if (weekLogs.length >= (habit.weekly_target || 0)) {
            isDone = true;
            done++;
          }
        } else {
          // Check if logged today
          if (
            (logs || []).some(
              (l) => l.habit_id === habit.id && l.log_date === localDate
            )
          ) {
            isDone = true;
            done++;
          }
        }

        if (!isDone) {
          pendingNames.push(habit.name);
        }
      }

      const pending = expected.length - done;
      if (pending === 0) continue;

      // Compose notification payload
      const pendingStr = pendingNames.join(", ");
      let title: string;
      let body: string;

      if (profile.locale === "pt") {
        title = "Seus hábitos de hoje";
        let msg = `${done} de ${expected.length} feitos — faltam: ${pendingStr}`;
        body = msg.length > 120 ? msg.substring(0, 117) + "…" : msg;
      } else {
        title = "Today's habits";
        let msg = `${done} of ${expected.length} done — remaining: ${pendingStr}`;
        body = msg.length > 120 ? msg.substring(0, 117) + "…" : msg;
      }

      const payload = {
        title,
        body,
        url: "/",
      };

      // Send to all subscriptions
      const { data: subs, error: subsError } = await client
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", pref.user_id);

      if (subsError) throw subsError;

      for (const sub of subs || []) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify(payload)
          );

          // Update last_used_at on success
          await client
            .from("push_subscriptions")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", sub.id);

          sent++;
        } catch (err: unknown) {
          const error = err as { statusCode?: number; message?: string };

          // Delete stale subscription (404/410)
          if (error.statusCode === 404 || error.statusCode === 410) {
            await client
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
            cleaned++;
          } else {
            console.error(
              `Failed to send to ${sub.endpoint}: ${error.statusCode} ${error.message}`
            );
          }
        }
      }

      // Record delivery
      await client
        .from("notification_deliveries")
        .insert({
          user_id: pref.user_id,
          local_date: localDate,
          reminder_time: pref.reminder_time,
          done_count: done,
          pending_count: pending,
        });
    }

    const summary = { checked, matched, sent, cleaned };
    console.log(JSON.stringify(summary));

    return new Response(JSON.stringify(summary), { status: 200 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error(error.message || error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
});
