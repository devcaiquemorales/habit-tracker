"use client";

import { mutate } from "swr";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";
import { computeHabitStreak } from "@/domain/lib/compute-habit-streak";
import { getUtcToday, toUtcDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import { isTodayScheduled } from "@/domain/types/schedule";

export const DASHBOARD_SWR_KEY = "/api/dashboard";

export async function fetchDashboardJson(): Promise<DashboardJson> {
  const res = await fetch(DASHBOARD_SWR_KEY, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }
  return res.json() as Promise<DashboardJson>;
}

/** Background refresh; does not block UI or clear the existing cached data. */
export function revalidateDashboardCache(): void {
  void mutate(DASHBOARD_SWR_KEY);
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
  const today = getUtcToday();
  const todayKey = toUtcDateKey(today);

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
          streak: computeHabitStreak(keys, today),
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
