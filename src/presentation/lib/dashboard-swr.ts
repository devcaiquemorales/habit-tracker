"use client";

import { useSWRConfig } from "swr";
import { mutate } from "swr";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";
import { computeStreak } from "@/domain/lib/compute-streak";
import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import { isTodayScheduled } from "@/domain/types/schedule";

export const DASHBOARD_SWR_KEY = "/api/dashboard";

let revalidateTimer: NodeJS.Timeout | null = null;

export async function fetchDashboardJson(): Promise<DashboardJson> {
  const res = await fetch(DASHBOARD_SWR_KEY, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }
  return res.json() as Promise<DashboardJson>;
}

/** Background refresh; debounces 2500ms from last call unless immediate=true. */
export function revalidateDashboardCache(options?: { immediate?: boolean }): void {
  if (options?.immediate) {
    if (revalidateTimer) clearTimeout(revalidateTimer);
    revalidateTimer = null;
    void mutate(DASHBOARD_SWR_KEY);
    return;
  }

  if (revalidateTimer) clearTimeout(revalidateTimer);
  revalidateTimer = setTimeout(() => {
    revalidateTimer = null;
    void mutate(DASHBOARD_SWR_KEY);
  }, 2500);
}

export function patchDashboardProfile(updates: {
  displayName?: string;
  motivationPhrase?: string;
}): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      return {
        ...current,
        profile: {
          ...current.profile,
          ...(updates.displayName !== undefined && {
            displayName: updates.displayName,
          }),
          ...(updates.motivationPhrase !== undefined && {
            motivationPhrase: updates.motivationPhrase,
          }),
        },
      };
    },
    { revalidate: false },
  );
  revalidateDashboardCache();
}

export function patchDashboardMotivationPhrase(phrase: string): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      return {
        ...current,
        profile: { ...current.profile, motivationPhrase: phrase },
      };
    },
    { revalidate: false },
  );
  revalidateDashboardCache();
}

export function removeHabitFromDashboard(habitId: string): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      const logKeysRecord = { ...current.logKeysRecord };
      delete logKeysRecord[habitId];
      return {
        ...current,
        habits: current.habits.filter((h) => h.id !== habitId),
        logKeysRecord,
      };
    },
    { revalidate: false },
  );
  revalidateDashboardCache();
}

export function patchDashboardHabit(
  habitId: string,
  update: Pick<Habit, "name" | "colorVariant" | "schedule">,
): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      return {
        ...current,
        habits: current.habits.map((h) =>
          h.id === habitId ? { ...h, ...update } : h,
        ),
      };
    },
    { revalidate: false },
  );
  revalidateDashboardCache();
}

export function patchDashboardAfterLogMutation(
  habitId: string,
  dateKey: string,
  mode: "add" | "remove",
): void {
  const today = getLocalToday();
  const todayKey = toLocalDateKey(today);

  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      const logKeysRecord = { ...current.logKeysRecord };
      const keys = new Set(logKeysRecord[habitId] ?? []);
      if (mode === "add") {
        keys.add(dateKey);
      } else {
        keys.delete(dateKey);
      }
      logKeysRecord[habitId] = [...keys];

      const habits = current.habits.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          streak: computeStreak(keys, h.schedule, todayKey).count,
          completedToday:
            keys.has(todayKey) && isTodayScheduled(h.schedule, today),
        };
      });

      return { ...current, logKeysRecord, habits };
    },
    { revalidate: false },
  );

  revalidateDashboardCache();
}

/** Hook: read cached dashboard data from SWR store. Used to seed detail screens with instant data from dashboard cache. */
export function useCachedDashboard(): DashboardJson | undefined {
  const { cache } = useSWRConfig();
  try {
    // SWR v2 stores an internal state object per key; the payload lives in `.data`.
    const state = cache.get(DASHBOARD_SWR_KEY) as
      | { data?: DashboardJson }
      | undefined;
    return state?.data;
  } catch {
    return undefined;
  }
}
