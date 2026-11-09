"use client";

import { useConvexAuth } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { api } from "@/../convex/_generated/api";
import { computeStreak } from "@/domain/lib/compute-streak";
import type { DashboardJson } from "@/domain/types/dashboard";
import {
  addDaysToDateKey,
  getLocalToday,
  localDateFromDateKey,
  toLocalDateKey,
} from "@/domain/types/date-key";
import { isTodayScheduled } from "@/domain/types/schedule";
import { authClient } from "@/infrastructure/auth/auth-client";
import { useSafeQuery } from "@/presentation/hooks/use-safe-query";
import {
  clearDashboardCache,
  readDashboardCache,
  writeDashboardCache,
} from "@/presentation/lib/dashboard-cache";

/** Fetch window for logs: covers the 12-month heatmap and the streak walk. */
const LOG_WINDOW_DAYS = 400;

type DashboardState = {
  data: DashboardJson | undefined;
  /** True once `data` comes from the server, not the local snapshot. */
  isLive: boolean;
  error: Error | undefined;
  /** The user's current local day; rolls over when the app comes back. */
  todayKey: string;
  /** Undefined until first loaded. */
  reminders: FunctionReturnType<typeof api.reminders.list> | undefined;
};

const DashboardContext = createContext<DashboardState>({
  data: undefined,
  isLive: false,
  error: undefined,
  todayKey: "",
  reminders: undefined,
});

const subscribeNoop = () => () => {};

let startupSnapshot: DashboardJson | null | undefined;

/** The snapshot from the last visit, read once per page load. */
function readStartupSnapshot(): DashboardJson | null {
  if (startupSnapshot === undefined) startupSnapshot = readDashboardCache();
  return startupSnapshot;
}

function currentDayKey(): string {
  return toLocalDateKey(getLocalToday());
}

/** Keeps one live subscription across routes, so moving between screens never refetches. */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const [todayKey, setTodayKey] = useState(currentDayKey);
  const [sinceKey] = useState(() =>
    addDaysToDateKey(currentDayKey(), -LOG_WINDOW_DAYS),
  );
  // Null on the server so both sides agree on the first render.
  const cached = useSyncExternalStore(
    subscribeNoop,
    readStartupSnapshot,
    () => null,
  );

  // A PWA left open overnight must roll over to the new day when it comes back.
  useEffect(() => {
    const refreshDay = () => setTodayKey(currentDayKey());
    document.addEventListener("visibilitychange", refreshDay);
    return () => document.removeEventListener("visibilitychange", refreshDay);
  }, []);

  const result = useSafeQuery(
    api.dashboard.get,
    isAuthenticated ? { sinceKey } : "skip",
  );
  // The server no longer recognizes this session: end it so login cannot loop back.
  useEffect(() => {
    if (result !== null) return;
    clearDashboardCache();
    void authClient.signOut().finally(() => window.location.assign("/login"));
  }, [result]);

  const reminderResult = useSafeQuery(
    api.reminders.list,
    isAuthenticated ? {} : "skip",
  );
  const reminders = reminderResult instanceof Error ? undefined : reminderResult;

  const error = result instanceof Error ? result : undefined;
  const raw = result instanceof Error ? undefined : (result ?? undefined);

  const live = useMemo<DashboardJson | undefined>(() => {
    if (!raw) return undefined;
    const today = localDateFromDateKey(todayKey) ?? getLocalToday();
    return {
      profile: raw.profile,
      logKeysRecord: raw.logKeysRecord,
      habits: raw.habits.map((habit) => {
        const keys = new Set(raw.logKeysRecord[habit.id] ?? []);
        return {
          ...habit,
          streak: computeStreak(keys, habit.schedule, todayKey).count,
          completedToday:
            keys.has(todayKey) && isTodayScheduled(habit.schedule, today),
        };
      }),
    };
  }, [raw, todayKey]);

  useEffect(() => {
    if (live) writeDashboardCache(live);
  }, [live]);

  const value = useMemo<DashboardState>(
    () => ({
      data: live ?? cached ?? undefined,
      isLive: !!live,
      error,
      todayKey,
      reminders,
    }),
    [live, cached, error, todayKey, reminders],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardState {
  return useContext(DashboardContext);
}
