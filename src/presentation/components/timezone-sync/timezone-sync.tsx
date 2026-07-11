"use client";

import { useEffect } from "react";

import { syncTimezoneAction } from "@/app/actions/profile-actions";

export function TimezoneSyncProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = "tz-synced";
    if (sessionStorage.getItem(key)) return;

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;

      sessionStorage.setItem(key, "1");
      syncTimezoneAction(tz).catch(() => {
        // Fire-and-forget; ignore errors
      });
    } catch {
      // Ignore errors
    }
  }, []);

  return null;
}
