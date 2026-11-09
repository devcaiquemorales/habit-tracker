"use client";

import { Flame, Zap } from "lucide-react";

import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { getStreakTier } from "@/presentation/lib/streak-tier";

export interface StreakBadgeProps {
  streak: number;
  unit?: "days" | "weeks";
  /** When set, overrides visible label for assistive tech (avoids duplicating the number in nearby text). */
  "aria-label"?: string;
}

const TIER_CLASS = {
  low: "text-xs text-muted-foreground",
  normal: "text-sm text-muted-foreground",
  hot: "text-sm text-foreground/80",
  fire: "text-sm text-orange-600 dark:text-orange-300",
  legend: "text-sm font-medium text-yellow-600 dark:text-yellow-400",
} as const;

export function StreakBadge({
  streak,
  unit = "days",
  "aria-label": ariaLabel,
}: StreakBadgeProps) {
  const { t } = useI18n();
  const tier = getStreakTier(streak);
  if (tier === "none") return null;

  const Icon = tier === "legend" ? Zap : Flame;

  return (
    <span
      className={`inline-flex items-center gap-1 tabular-nums ${TIER_CLASS[tier]}`}
      aria-label={ariaLabel}
    >
      <Icon className="size-3.5" aria-hidden />
      <span>{unit === "weeks" ? t("streak.weeksShort", { n: streak }) : streak}</span>
    </span>
  );
}
