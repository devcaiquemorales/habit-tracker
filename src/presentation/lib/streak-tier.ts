export type StreakTier = "none" | "low" | "normal" | "hot" | "fire" | "legend";

export function getStreakTier(streak: number): StreakTier {
  if (streak === 0) return "none";
  if (streak <= 2) return "low";
  if (streak <= 6) return "normal";
  if (streak <= 13) return "hot";
  if (streak <= 29) return "fire";
  return "legend";
}
