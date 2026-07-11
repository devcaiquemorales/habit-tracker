"use client";

import { useCallback, useEffect, useState } from "react";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";
import { streakUnitForSchedule } from "@/domain/lib/compute-streak";
import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { StreakMilestoneToastPayload } from "@/presentation/components/streak-milestone-toast";
import { recoveryMissedDayCountBefore } from "@/presentation/lib/detect-streak-recovery";

export const STREAK_MILESTONES = [
  7, 14, 21, 30, 60, 90, 180, 365,
] as const;

type ToastInternal = StreakMilestoneToastPayload & { habitId: string };

export function useStreakMomentumToast(data: DashboardJson | undefined): {
  toast: StreakMilestoneToastPayload | null;
  dismissToast: () => void;
} {
  const [toast, setToast] = useState<ToastInternal | null>(null);

  const dismissToast = useCallback(() => {
    setToast((current) => {
      if (!current || typeof window === "undefined") return null;
      if (current.kind === "milestone") {
        localStorage.setItem(
          `streak-milestone-seen:${current.habitId}:${current.streak}`,
          "1",
        );
      } else {
        const todayKey = toLocalDateKey(getLocalToday());
        localStorage.setItem(
          `streak-recovery-seen:${current.habitId}:${todayKey}`,
          "1",
        );
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    if (toast !== null) return;

    const id = window.setTimeout(() => {
      const todayKey = toLocalDateKey(getLocalToday());

      for (const h of data.habits) {
        if (streakUnitForSchedule(h.schedule) !== "days") {
          continue;
        }
        if (!(STREAK_MILESTONES as readonly number[]).includes(h.streak)) {
          continue;
        }
        const key = `streak-milestone-seen:${h.id}:${h.streak}`;
        if (!localStorage.getItem(key)) {
          setToast({
            habitId: h.id,
            kind: "milestone",
            habitName: h.name,
            streak: h.streak,
          });
          return;
        }
      }

      for (const h of data.habits) {
        if (streakUnitForSchedule(h.schedule) !== "days") {
          continue;
        }
        const keys = data.logKeysRecord[h.id] ?? [];
        if (!keys.includes(todayKey)) continue;
        const missed = recoveryMissedDayCountBefore(keys, todayKey, h.schedule);
        if (missed === null) continue;
        const rkey = `streak-recovery-seen:${h.id}:${todayKey}`;
        if (!localStorage.getItem(rkey)) {
          setToast({
            habitId: h.id,
            kind: "recovery",
            habitName: h.name,
            missedDays: missed,
          });
          return;
        }
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [data, toast]);

  const publicPayload: StreakMilestoneToastPayload | null = toast
    ? toast.kind === "milestone"
      ? {
          kind: "milestone",
          habitName: toast.habitName,
          streak: toast.streak,
        }
      : {
          kind: "recovery",
          habitName: toast.habitName,
          missedDays: toast.missedDays,
        }
    : null;

  return { toast: publicPayload, dismissToast };
}
