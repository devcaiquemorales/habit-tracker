"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDashboard } from "@/presentation/lib/dashboard-context";

import { HabitDetailScreen } from "./habit-detail-screen";
import { HabitDetailSkeleton } from "./habit-detail-skeleton";

/** Resolves a habit from the live dashboard; an unknown or deleted id goes back home. */
export function HabitDetailRoute({ habitId }: { habitId: string }) {
  const { data, isLive } = useDashboard();
  const router = useRouter();
  const habit = data?.habits.find((h) => h.id === habitId);
  const missing = isLive && !habit;

  useEffect(() => {
    if (missing) router.replace("/");
  }, [missing, router]);

  if (!habit || !data) return <HabitDetailSkeleton />;

  return (
    <HabitDetailScreen
      key={habit.id}
      habit={habit}
      completedKeys={data.logKeysRecord[habit.id] ?? []}
    />
  );
}
