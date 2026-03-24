"use client";

import { memo, useMemo } from "react";

import type { Habit } from "@/domain/types/habit";
import { HabitCard } from "@/presentation/components/habit-card";
import { buildHeatmapDataFromCompletedKeys } from "@/presentation/lib/build-heatmap-data";

type HabitCardWithHeatmapProps = {
  habit: Habit;
  completedKeys: string[];
};

function sortedKeysSignature(keys: readonly string[]): string {
  if (keys.length === 0) return "";
  return [...keys].sort().join(",");
}

/**
 * Avoids rebuilding 12-month heatmap data when unrelated dashboard fields change.
 */
export const HabitCardWithHeatmap = memo(function HabitCardWithHeatmap({
  habit,
  completedKeys,
}: HabitCardWithHeatmapProps) {
  const keysSig = useMemo(
    () => sortedKeysSignature(completedKeys),
    [completedKeys],
  );

  const heatmapData = useMemo(() => {
    const keys = keysSig === "" ? [] : keysSig.split(",");
    return buildHeatmapDataFromCompletedKeys(new Set(keys));
  }, [keysSig]);

  return (
    <HabitCard
      habitId={habit.id}
      name={habit.name}
      schedule={habit.schedule}
      streak={habit.streak}
      colorVariant={habit.colorVariant}
      data={heatmapData}
    />
  );
});
