"use client";

import { mutate } from "swr";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";
import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { DASHBOARD_SWR_KEY } from "@/presentation/lib/dashboard-swr";

/**
 * Add a temporary habit to the dashboard cache optimistically.
 * Returns the temp ID for later removal if needed.
 */
export function addTempHabitToDashboard(
  name: string,
  colorVariant: ColorVariant,
  schedule: Schedule,
): string {
  const tempId = `temp-${Date.now()}`;

  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      return {
        ...current,
        habits: [
          ...current.habits,
          {
            id: tempId,
            name,
            colorVariant,
            schedule,
            streak: 0,
            completedToday: false,
            position: current.habits.length,
          },
        ],
        logKeysRecord: {
          ...current.logKeysRecord,
          [tempId]: [],
        },
      };
    },
    { revalidate: false },
  );

  return tempId;
}

/**
 * Replace a temporary habit with a real one in the dashboard cache.
 * Used when the create habit action completes successfully.
 */
export function replaceTempHabitInDashboard(
  tempId: string,
  realHabit: DashboardJson["habits"][0],
): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      const logKeysRecord = { ...current.logKeysRecord };
      const logKeys = logKeysRecord[tempId];
      if (logKeys) {
        delete logKeysRecord[tempId];
        logKeysRecord[realHabit.id] = logKeys;
      }
      return {
        ...current,
        habits: current.habits.map((h) => (h.id === tempId ? realHabit : h)),
        logKeysRecord,
      };
    },
    { revalidate: false },
  );
}

/**
 * Remove a temporary (or any) habit from the dashboard cache.
 * Used on error or when rolling back.
 */
export function removeTempHabitFromDashboard(tempId: string): void {
  void mutate(
    DASHBOARD_SWR_KEY,
    (current: DashboardJson | undefined) => {
      if (!current) return current;
      const logKeysRecord = { ...current.logKeysRecord };
      delete logKeysRecord[tempId];
      return {
        ...current,
        habits: current.habits.filter((h) => h.id !== tempId),
        logKeysRecord,
      };
    },
    { revalidate: false },
  );
}
