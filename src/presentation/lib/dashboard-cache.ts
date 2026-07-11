"use client";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";

const DASHBOARD_LS_KEY = "dashboard-cache-v2";

/** Reads the last persisted dashboard snapshot from localStorage. Returns null on miss or parse error. Cleans up old unversioned keys. */
export function readDashboardCache(): DashboardJson | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_LS_KEY);
    if (raw) {
      return JSON.parse(raw) as DashboardJson;
    }
    // Versioned key missing; clean up old unversioned key if present
    try {
      localStorage.removeItem("dashboard-cache");
    } catch {
      // ignore removal errors
    }
    return null;
  } catch {
    return null;
  }
}

/** Persists the latest dashboard snapshot to localStorage so cold starts can render immediately. */
export function writeDashboardCache(data: DashboardJson): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DASHBOARD_LS_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — ignore silently
  }
}
