"use server";

import {
  deletePushSubscription,
  deleteReminderPreference,
  savePushSubscription,
  setReminderEnabled,
  upsertReminderPreference,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";

function validateReminderTime(time: string): boolean {
  const match = /^([01]\d|2[0-3]):[0-5]\d$/.exec(time);
  return !!match;
}

export async function savePushSubscriptionAction(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await savePushSubscription(supabase, user.id, input);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.savePushSubscriptionFailed",
    };
  }
}

export async function deletePushSubscriptionAction(
  endpoint: string,
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await deletePushSubscription(supabase, user.id, endpoint);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.deletePushSubscriptionFailed",
    };
  }
}

export async function upsertReminderAction(
  reminderTime: string,
  enabled: boolean,
): Promise<LocalizedActionResult> {
  if (!validateReminderTime(reminderTime)) {
    return { error: null, errorKey: "errors.invalidReminderTime" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await upsertReminderPreference(supabase, user.id, reminderTime, enabled);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.upsertReminderFailed",
    };
  }
}

export async function deleteReminderAction(
  id: string,
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await deleteReminderPreference(supabase, user.id, id);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.deleteReminderFailed",
    };
  }
}

export async function setReminderEnabledAction(
  id: string,
  enabled: boolean,
): Promise<LocalizedActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null, errorKey: "errors.notSignedIn" };
  }

  try {
    await setReminderEnabled(supabase, user.id, id, enabled);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "",
      errorKey: "errors.setReminderEnabledFailed",
    };
  }
}
