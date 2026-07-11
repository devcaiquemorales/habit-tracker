"use client";

import { getStreakTier } from "@/presentation/lib/streak-tier";

const FIRE = "\u{1F525}";
const LIGHTNING = "\u{26A1}\u{FE0F}";

export interface StreakBadgeProps {
  streak: number;
  unit?: "days" | "weeks";
  /** When set, overrides visible label for assistive tech (avoids duplicating the number in nearby text). */
  "aria-label"?: string;
}

function getUnitLabel(unit: "days" | "weeks", count: number): string {
  if (unit === "weeks") {
    return count === 1 ? "1w" : `${count}w`;
  }
  return count.toString();
}

export function StreakBadge({
  streak,
  unit = "days",
  "aria-label": ariaLabel,
}: StreakBadgeProps) {
  const tier = getStreakTier(streak);
  if (tier === "none") return null;

  const label = getUnitLabel(unit, streak);

  if (tier === "low") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs opacity-40"
        aria-label={ariaLabel}
      >
        <span aria-hidden>{FIRE}</span>
        <span>{label}</span>
      </span>
    );
  }

  if (tier === "normal") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-sm text-white/60"
        aria-label={ariaLabel}
      >
        <span aria-hidden>{FIRE}</span>
        <span>{label}</span>
      </span>
    );
  }

  if (tier === "hot") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-sm text-white/60"
        aria-label={ariaLabel}
      >
        <span className="streak-pulse inline-flex" aria-hidden>
          {FIRE}
        </span>
        <span>{label}</span>
      </span>
    );
  }

  if (tier === "fire") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-sm text-orange-300"
        aria-label={ariaLabel}
      >
        <span className="inline-flex text-base leading-none" aria-hidden>
          {FIRE}
        </span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-400 [filter:drop-shadow(0_0_6px_rgba(250,204,21,0.35))]"
      aria-label={ariaLabel}
    >
      <span aria-hidden>{LIGHTNING}</span>
      <span>{label}</span>
    </span>
  );
}
