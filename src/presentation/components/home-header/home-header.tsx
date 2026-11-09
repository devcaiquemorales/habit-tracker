"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { formatHomeHeaderDate } from "@/presentation/lib/i18n/format";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { getTimeAwareGreeting } from "@/presentation/lib/time-aware-greeting";

interface HomeHeaderProps {
  /** Maps to profile / `user_metadata.display_name`. */
  userName?: string;
  /** Maps to profile `motivation_phrase`. */
  initialMotivationPhrase?: string;
}

export function HomeHeader({
  userName = "there",
  initialMotivationPhrase = "",
}: HomeHeaderProps) {
  const { t, locale } = useI18n();

  const greeting = useMemo(
    () => getTimeAwareGreeting(userName, new Date(), locale),
    [userName, locale],
  );

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
            className="text-2xl font-semibold tracking-tight text-foreground"
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
        <Link
          href="/settings"
          scroll={false}
          onClick={() => triggerInteractionFeedback({ haptic: false })}
          className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px md:size-8"
          aria-label={t("home.settingsAria")}
        >
          <Settings className="size-5 md:size-4" aria-hidden />
        </Link>
      </div>

      {phrase ? (
        <p className="mt-3 min-w-0 leading-relaxed wrap-break-word">
          <span className="text-xs font-medium text-muted-foreground">
            {t("home.motivationPrefix")}{" "}
          </span>
          <span className="text-sm font-medium text-foreground/80">{phrase}</span>
        </p>
      ) : null}
    </div>
  );
}
