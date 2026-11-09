"use client";

import { useMutation } from "convex/react";
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { formatActionError } from "@/presentation/lib/action-error";
import { toActionResult } from "@/presentation/lib/convex-result";
import { useDashboard } from "@/presentation/lib/dashboard-context";
import { PUSH_ENABLED_KEY } from "@/presentation/lib/device-sync";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

const subscribeNoop = () => () => {};

function readPushSupport(): "supported" | "ios" | "unsupported" {
  if (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  ) {
    return "supported";
  }
  return /(iPhone|iPad|iPod)/.test(navigator.userAgent) &&
    !window.matchMedia("(display-mode: standalone)").matches
    ? "ios"
    : "unsupported";
}

function readPushEnabled(): boolean {
  try {
    return localStorage.getItem(PUSH_ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

const HOURS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

/**
 * Resolves the active service worker registration WITHOUT hanging.
 * `navigator.serviceWorker.ready` never resolves when no SW is registered
 * (e.g. dev mode, where next-pwa disables the worker) — awaiting it directly
 * froze the enable button in an infinite loading state.
 */
async function getPushRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) return null;
    // Prefer the fully-active registration, but never wait more than 3s.
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((resolve) => {
        setTimeout(() => resolve(existing), 3000);
      }),
    ]);
  } catch {
    return null;
  }
}

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

export function NotificationSettings() {
  const { t } = useI18n();
  const { reminders: liveReminders } = useDashboard();
  const reminders = liveReminders ?? [];
  const support = useSyncExternalStore(
    subscribeNoop,
    readPushSupport,
    () => "pending",
  );
  const storedEnabled = useSyncExternalStore(
    subscribeNoop,
    readPushEnabled,
    () => false,
  );
  // Starts from the last known state and only changes if the browser disagrees.
  const [verifiedEnabled, setVerifiedEnabled] = useState<boolean | null>(null);
  const isSubscribed = verifiedEnabled ?? storedEnabled;
  const isSupported = support === "supported";
  const isIosStandalone = support === "ios";
  const saveSubscription = useMutation(api.reminders.saveSubscription);
  const deleteSubscription = useMutation(api.reminders.deleteSubscription);
  const upsertReminder = useMutation(api.reminders.upsert);
  const removeReminder = useMutation(api.reminders.remove).withOptimisticUpdate(
    (store, { reminderId }) => {
      const current = store.getQuery(api.reminders.list, {});
      if (current) {
        store.setQuery(
          api.reminders.list,
          {},
          current.filter((reminder) => reminder.id !== reminderId),
        );
      }
    },
  );
  const setReminderEnabled = useMutation(
    api.reminders.setEnabled,
  ).withOptimisticUpdate((store, { reminderId, enabled }) => {
    const current = store.getQuery(api.reminders.list, {});
    if (current) {
      store.setQuery(
        api.reminders.list,
        {},
        current.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, enabled } : reminder,
        ),
      );
    }
  });
  const [newReminderTime, setNewReminderTime] = useState("09:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setIsSubscribed = (enabled: boolean) => {
    setVerifiedEnabled(enabled);
    try {
      localStorage.setItem(PUSH_ENABLED_KEY, enabled ? "1" : "0");
    } catch {
      // Only a paint hint: the browser stays the source of truth.
    }
  };

  useEffect(() => {
    if (support === "supported") void checkSubscription();
    // Runs once support is known; the check itself only reads the browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [support]);

  async function checkSubscription() {
    try {
      const registration = await getPushRegistration();
      const subscription = await registration?.pushManager.getSubscription();
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

      const registration = await getPushRegistration();
      if (!registration) {
        setError(t("notifications.swUnavailable"));
        return;
      }
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

      const result = await toActionResult(
        saveSubscription({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
          userAgent: navigator.userAgent,
        }),
      );

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
      const registration = await getPushRegistration();
      if (!registration) {
        setIsSubscribed(false);
        return;
      }
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        const subJson = subscription.toJSON() as { endpoint: string };
        await deleteSubscription({ endpoint: subJson.endpoint });
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
    const result = await toActionResult(
      upsertReminder({ reminderTime: newReminderTime, enabled: true }),
    );
    setError(formatActionError(result, t));
    setIsLoading(false);
  }

  async function handleDeleteReminder(id: string) {
    setError(null);
    const result = await toActionResult(
      removeReminder({ reminderId: id as Id<"reminders"> }),
    );
    setError(formatActionError(result, t));
  }

  async function handleToggleReminder(id: string, enabled: boolean) {
    setError(null);
    const result = await toActionResult(
      setReminderEnabled({
        reminderId: id as Id<"reminders">,
        enabled: !enabled,
      }),
    );
    setError(formatActionError(result, t));
  }

  if (support === "pending") {
    return <div className="h-24 animate-pulse rounded-xl bg-muted" aria-hidden />;
  }

  if (!isSupported) {
    if (isIosStandalone) {
      return (
        <section className="space-y-3">
          <div className="flex gap-3 rounded-xl bg-amber-500/10 p-4">
            <Bell className="size-5 shrink-0 text-amber-800 dark:text-amber-300" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {t("notifications.iosStandalone")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("notifications.iosStandaloneDescription")}
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-3">
        <div className="text-sm text-muted-foreground">{t("notifications.unsupported")}</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!isSubscribed ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("notifications.permissionPrompt")}
          </p>
          <Button
            onClick={handleEnableReminders}
            variant="secondary"
            loading={isLoading}
            loadingText={t("common.loading")}
            className="h-11 w-full rounded-full md:h-9"
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
                    className="flex items-center gap-3 rounded-xl bg-foreground/5 p-3"
                  >
                    <div className="flex-1">
                      <time className="text-sm font-medium text-foreground">
                        {reminder.reminderTime}
                      </time>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleReminder(reminder.id, reminder.enabled)
                      }
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors duration-200 after:absolute after:-inset-2.5 motion-reduce:transition-none",
                        reminder.enabled
                          ? "bg-primary"
                          : "bg-foreground/15 hover:bg-foreground/25",
                      )}
                      aria-label={
                        reminder.enabled
                          ? t("notifications.enabled")
                          : t("notifications.disabled")
                      }
                    >
                      <span
                        className={cn(
                          "size-5 rounded-full bg-background shadow-xs transition-transform duration-200 motion-reduce:transition-none",
                          reminder.enabled ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:size-8"
                      aria-label={t("notifications.removeReminder")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            ) : liveReminders ? (
              <p className="text-sm text-muted-foreground">{t("notifications.noReminders")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time">
              {t("notifications.addReminder")}
            </Label>
            <div className="flex gap-2">
              <select
                id="reminder-time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-9 md:text-sm dark:bg-input/30"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddReminder}
                variant="secondary"
                loading={isLoading}
                loadingText={t("common.loading")}
                className="h-11 rounded-full md:h-9"
              >
                {t("notifications.addReminderButton")}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDisableReminders}
            loading={isLoading}
            loadingText={t("common.loading")}
            variant="ghost"
            className="h-11 w-full rounded-full md:h-9"
          >
            {t("notifications.disableButton")}
          </Button>
        </div>
      )}
    </section>
  );
}
