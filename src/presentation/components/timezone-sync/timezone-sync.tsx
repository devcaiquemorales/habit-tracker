"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@/../convex/_generated/api";
import { DEVICE_SYNC_KEY } from "@/presentation/lib/device-sync";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

export function TimezoneSyncProvider() {
  const { isAuthenticated } = useConvexAuth();
  const { locale } = useI18n();
  const syncDevice = useMutation(api.profiles.syncDevice);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Also runs on return, so a trip across time zones updates the "local day".
    const sync = () => {
      if (document.visibilityState !== "visible") return;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!timezone) return;
      const signature = `${timezone}|${locale}`;
      if (sessionStorage.getItem(DEVICE_SYNC_KEY) === signature) return;

      sessionStorage.setItem(DEVICE_SYNC_KEY, signature);
      syncDevice({ timezone, locale }).catch(() => {
        // Retried on the next return; the last synced values stay valid meanwhile.
        sessionStorage.removeItem(DEVICE_SYNC_KEY);
      });
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [isAuthenticated, locale, syncDevice]);

  return null;
}
