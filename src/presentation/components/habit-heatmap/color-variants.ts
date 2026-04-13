import type { ColorVariant } from "@/domain/types/habit";

export type { ColorVariant };

interface StreakClasses {
  low: string;
  medium: string;
  high: string;
}

interface VariantConfig {
  doneClass: string;
  missedClass: string;
  notExpectedClass: string;
  /** Past day with no log on weekly-target habits (not a fixed “miss”). */
  emptyDayClass: string;
  /**
   * Week-alignment placeholders (no calendar date). More visible than page
   * background but still below real inactive cells (e.g. emptyDay / notExpected).
   */
  monthPaddingClass: string;
  indicatorClass: string;
  streakClasses: StreakClasses;
}

/** Text color for positive same-day status (“Completed today”), per habit accent */
export const STATUS_ACCENT_TEXT: Record<ColorVariant, string> = {
  green: "text-emerald-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  red: "text-[#E8786A]",
};

export const COLOR_VARIANTS: Record<ColorVariant, VariantConfig> = {
  green: {
    doneClass: "bg-emerald-500",
    missedClass: "bg-white/15",
    notExpectedClass: "bg-white/[0.02]",
    emptyDayClass: "bg-white/[0.08]",
    monthPaddingClass: "bg-white/[0.045]",
    indicatorClass: "bg-emerald-500",
    streakClasses: {
      low: "text-white/40",
      medium: "text-emerald-500/55",
      high: "text-emerald-500/85",
    },
  },
  blue: {
    doneClass: "bg-blue-500",
    missedClass: "bg-white/15",
    notExpectedClass: "bg-white/[0.02]",
    emptyDayClass: "bg-white/[0.08]",
    monthPaddingClass: "bg-white/[0.045]",
    indicatorClass: "bg-blue-500",
    streakClasses: {
      low: "text-white/40",
      medium: "text-blue-500/55",
      high: "text-blue-500/85",
    },
  },
  amber: {
    doneClass: "bg-amber-500",
    missedClass: "bg-white/15",
    notExpectedClass: "bg-white/[0.02]",
    emptyDayClass: "bg-white/[0.08]",
    monthPaddingClass: "bg-white/[0.045]",
    indicatorClass: "bg-amber-500",
    streakClasses: {
      low: "text-white/40",
      medium: "text-amber-500/55",
      high: "text-amber-500/85",
    },
  },
  purple: {
    doneClass: "bg-purple-500",
    missedClass: "bg-white/15",
    notExpectedClass: "bg-white/[0.02]",
    emptyDayClass: "bg-white/[0.08]",
    monthPaddingClass: "bg-white/[0.045]",
    indicatorClass: "bg-purple-500",
    streakClasses: {
      low: "text-white/40",
      medium: "text-purple-500/55",
      high: "text-purple-500/85",
    },
  },
  red: {
    doneClass: "bg-[#D64B3B]",
    missedClass: "bg-white/15",
    notExpectedClass: "bg-white/[0.02]",
    emptyDayClass: "bg-white/[0.08]",
    monthPaddingClass: "bg-white/[0.045]",
    indicatorClass: "bg-[#D64B3B]",
    streakClasses: {
      low: "text-white/40",
      medium: "text-[#D64B3B]/55",
      high: "text-[#D64B3B]/85",
    },
  },
};
