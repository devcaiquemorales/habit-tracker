"use client";

import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  deletePushSubscriptionAction,
  deleteReminderAction,
  savePushSubscriptionAction,
  setReminderEnabledAction,
  upsertReminderAction,
} from "@/app/actions/push-actions";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatActionError } from "@/presentation/lib/action-error";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

type ReminderPreference = {
  id: string;
  reminderTime: string;
  enabled: boolean;
};

type NotificationSettingsProps = {
  initialPreferences: ReminderPreference[];
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationSettings({
  initialPreferences,
}: NotificationSettingsProps) {
  const { t } = useI18n();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isIosStandalone, setIsIosStandalone] = useState(false);
  const [reminders, setReminders] = useState<ReminderPreference[]>(
    initialPreferences,
  );
  const [newReminderTime, setNewReminderTime] = useState("09:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    const iosNotStandalone =
      /(iPhone|iPad|iPod)/.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches;

    setIsIosStandalone(iosNotStandalone);

    if (supported) {
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  }

  async function handleEnableReminders() {
    setError(null);
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(t("notifications.permissionDenied"));
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        setError("VAPID key not configured");
        setIsLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey,
        ) as BufferSource,
      });

      const subJson = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const result = await savePushSubscriptionAction({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        userAgent: navigator.userAgent,
      });

      const errMsg = formatActionError(result, t);
      if (errMsg) {
        setError(errMsg);
        return;
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error("Error enabling reminders:", err);
      setError(
        err instanceof Error ? err.message : t("notifications.permissionDenied"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisableReminders() {
    setError(null);
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        const subJson = subscription.toJSON() as { endpoint: string };
        await deletePushSubscriptionAction(subJson.endpoint);
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error("Error disabling reminders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to disable reminders",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddReminder() {
    setError(null);
    setIsLoading(true);

    // Optimistic: add temp reminder immediately
    const tempId = `temp-${Date.now()}`;
    const tempReminder: ReminderPreference = {
      id: tempId,
      reminderTime: newReminderTime,
      enabled: true,
    };
    setReminders((prev) => [...prev, tempReminder]);
    setNewReminderTime("09:00");

    try {
      const result = await upsertReminderAction(newReminderTime, true);
      const errMsg = formatActionError(result, t);
      if (errMsg) {
        // Rollback on error
        setReminders((prev) => prev.filter((r) => r.id !== tempId));
        setError(errMsg);
        return;
      }

      // Refetch reminders to get the real one with proper ID
      const response = await fetch("/api/reminders");
      if (response.ok) {
        const prefs = await response.json();
        setReminders(prefs);
      }
    } catch (err) {
      // Rollback on exception
      setReminders((prev) => prev.filter((r) => r.id !== tempId));
      console.error("Error adding reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add reminder",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteReminder(id: string) {
    setError(null);

    // Optimistic: remove immediately
    const previousReminders = reminders;
    setReminders((prev) => prev.filter((r) => r.id !== id));

    try {
      const result = await deleteReminderAction(id);
      const errMsg = formatActionError(result, t);
      if (errMsg) {
        // Rollback on error
        setReminders(previousReminders);
        setError(errMsg);
        return;
      }
    } catch (err) {
      // Rollback on exception
      setReminders(previousReminders);
      console.error("Error deleting reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete reminder",
      );
    }
  }

  async function handleToggleReminder(id: string, enabled: boolean) {
    setError(null);

    // Optimistic: toggle immediately
    const previousReminders = reminders;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)),
    );

    try {
      const result = await setReminderEnabledAction(id, !enabled);
      const errMsg = formatActionError(result, t);
      if (errMsg) {
        // Rollback on error
        setReminders(previousReminders);
        setError(errMsg);
        return;
      }
    } catch (err) {
      // Rollback on exception
      setReminders(previousReminders);
      console.error("Error toggling reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update reminder",
      );
    }
  }

  if (!isSupported) {
    if (isIosStandalone) {
      return (
        <section className="space-y-3">
          <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <Bell className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-white/90">
                {t("notifications.iosStandalone")}
              </p>
              <p className="text-xs text-white/50">
                {t("notifications.iosStandaloneDescription")}
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-3">
        <div className="text-sm text-white/45">{t("notifications.unsupported")}</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-white/45">{t("notifications.description")}</p>

      {error && (
        <p className="text-sm text-red-400/90" role="alert">
          {error}
        </p>
      )}

      {!isSubscribed ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/65">
              {t("notifications.permissionPrompt")}
            </p>
          </div>
          <Button
            onClick={handleEnableReminders}
            loading={isLoading}
            loadingText={t("common.loading")}
            className="w-full"
          >
            {t("notifications.enableButton")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {reminders.length > 0 ? (
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex-1">
                      <time className="text-sm font-medium text-white">
                        {reminder.reminderTime}
                      </time>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleReminder(reminder.id, reminder.enabled)
                      }
                      className={cn(
                        "inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors duration-200",
                        reminder.enabled
                          ? "bg-green-500/80"
                          : "bg-white/10 hover:bg-white/20",
                      )}
                      aria-label={
                        reminder.enabled
                          ? t("notifications.enabled")
                          : t("notifications.disabled")
                      }
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                          reminder.enabled ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-150 hover:text-white"
                      aria-label={t("notifications.removeReminder")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/45">{t("notifications.noReminders")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-white/70">
              {t("notifications.addReminder")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="reminder-time"
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                step={900}
                className="min-h-11 text-base sm:min-h-10 sm:text-sm flex-1"
              />
              <Button
                onClick={handleAddReminder}
                loading={isLoading}
                loadingText={t("common.loading")}
                className="min-h-11 sm:min-h-10"
              >
                {t("notifications.addReminderButton")}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDisableReminders}
            loading={isLoading}
            loadingText={t("common.loading")}
            variant="outline"
            className="w-full"
          >
            {t("notifications.disableButton")}
          </Button>
        </div>
      )}
    </section>
  );
}
