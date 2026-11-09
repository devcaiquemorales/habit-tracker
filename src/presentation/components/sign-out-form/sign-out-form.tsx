"use client";

import { useMutation } from "convex/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { api } from "@/../convex/_generated/api";
import { authClient } from "@/infrastructure/auth/auth-client";
import { Button } from "@/presentation/components/ui/button";
import { clearDashboardCache } from "@/presentation/lib/dashboard-cache";
import {
  DEVICE_SYNC_KEY,
  PUSH_ENABLED_KEY,
} from "@/presentation/lib/device-sync";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

/** Offline, the cleanup would never finish; sign-out cannot wait for it. */
const PUSH_CLEANUP_LIMIT_MS = 2000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SignOutForm({ className }: { className?: string }) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const deleteSubscription = useMutation(api.reminders.deleteSubscription);

  // This device must stop receiving the signed-out account's reminders.
  const stopPushOnThisDevice = async () => {
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) return;
      await deleteSubscription({ endpoint: subscription.endpoint });
      await subscription.unsubscribe();
    } catch {
      // Signing out must still work when this cleanup cannot.
    }
  };

  const handleSignOut = async () => {
    setPending(true);
    await Promise.race([stopPushOnThisDevice(), wait(PUSH_CLEANUP_LIMIT_MS)]);
    await authClient.signOut();
    clearDashboardCache();
    sessionStorage.removeItem(DEVICE_SYNC_KEY);
    localStorage.removeItem(PUSH_ENABLED_KEY);
    // A full load drops the live subscription along with the old session.
    window.location.assign("/login");
  };

  return (
    <div className={cn(className, "w-full")}>
      <Button
        type="button"
        variant="destructive"
        loading={pending}
        loadingText={t("common.signingOut")}
        className="h-11 w-full justify-center gap-2 rounded-full md:h-9"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        {t("common.signOut")}
      </Button>
    </div>
  );
}
