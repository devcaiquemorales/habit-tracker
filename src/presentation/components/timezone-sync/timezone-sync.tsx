"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@/../convex/_generated/api";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

const SYNCED_KEY = "device-synced";

export function TimezoneSyncProvider() {
  const { isAuthenticated } = useConvexAuth();
  const { locale } = useI18n();
  const syncDevice = useMutation(api.profiles.syncDevice);

  useEffect(() => {
    if (!isAuthenticated || sessionStorage.getItem(SYNCED_KEY)) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return;

    sessionStorage.setItem(SYNCED_KEY, "1");
    syncDevice({ timezone, locale }).catch(() => {
      // Retried next session; the last synced values stay valid meanwhile.
      sessionStorage.removeItem(SYNCED_KEY);
    });
  }, [isAuthenticated, locale, syncDevice]);

  return null;
}
