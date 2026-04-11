"use client";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";

const DASHBOARD_LS_KEY = "dashboard-cache-v2";

/** Reads the last persisted dashboard snapshot from localStorage. Returns null on miss or parse error. */
export function readDashboardCache(): DashboardJson | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_LS_KEY);
    return raw ? (JSON.parse(raw) as DashboardJson) : null;
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
