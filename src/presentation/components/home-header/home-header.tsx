"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";

import type { Habit } from "@/domain/types/habit";
import { pickHomeGreeting } from "@/presentation/lib/home-greeting";
import { formatHomeHeaderDate } from "@/presentation/lib/i18n/format";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

interface HomeHeaderProps {
  /** Maps to profile / `user_metadata.display_name`. */
  userName?: string;
  /** Maps to profile `motivation_phrase`. */
  initialMotivationPhrase?: string;
  /** Absent when there is no data to personalize the greeting from. */
  habits?: readonly Habit[];
  logKeysRecord?: Readonly<Record<string, readonly string[]>>;
  todayKey?: string;
  /** Extra controls shown before the settings button. */
  actions?: ReactNode;
}

const NO_LOGS: Readonly<Record<string, readonly string[]>> = {};

export function HomeHeader({
  userName = "there",
  initialMotivationPhrase = "",
  habits,
  logKeysRecord = NO_LOGS,
  todayKey = "",
  actions,
}: HomeHeaderProps) {
  const { t, locale } = useI18n();

  const greeting = useMemo(() => {
    const { key, vars } = pickHomeGreeting({
      displayName: userName,
      habits,
      logKeysRecord,
      todayKey,
      hour: new Date().getHours(),
    });
    return t(key, vars);
  }, [userName, habits, logKeysRecord, todayKey, t]);

  const dateStr = useMemo(
    () => formatHomeHeaderDate(new Date(), locale),
    [locale],
  );

  const phrase = initialMotivationPhrase.trim();

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h1
            className="text-2xl leading-tight font-semibold tracking-tight text-balance text-foreground"
            suppressHydrationWarning
          >
            {greeting}
          </h1>
          <p
            className="text-sm leading-snug text-muted-foreground"
            suppressHydrationWarning
          >
            {dateStr}
          </p>
        </div>
        <div className="-mr-2 flex shrink-0 items-center">
          {actions}
          <Link
          href="/settings"
          prefetch
          onClick={() => triggerInteractionFeedback({ haptic: false })}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px md:size-8"
          aria-label={t("home.settingsAria")}
        >
          <Settings className="size-5 md:size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {phrase ? (
        <p className="mt-3 min-w-0 leading-relaxed wrap-break-word">
          <span className="text-xs font-medium text-muted-foreground">
            {t("home.motivationPrefix")}{" "}
          </span>
          <span className="text-sm font-medium text-foreground/80">
            {phrase}
          </span>
        </p>
      ) : null}
    </div>
  );
}
