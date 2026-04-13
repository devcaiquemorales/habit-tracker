import type { Schedule } from "./schedule";

export type ColorVariant = "green" | "blue" | "amber" | "purple" | "red";

export interface Habit {
  id: string;
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
  streak: number;
  /** Whether the habit is marked done for the current calendar day */
  completedToday: boolean;
  /** Display order within the dashboard (0-based, persisted). */
  position: number;
}

export function getStreakLevel(streak: number): "low" | "medium" | "high" {
  if (streak <= 2) return "low";
  if (streak <= 6) return "medium";
  return "high";
}
