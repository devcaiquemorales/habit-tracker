"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
  const greeting = useMemo(
    () => getTimeAwareGreeting(userName, new Date()),
    [userName],
  );
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const phrase = initialMotivationPhrase.trim();

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            suppressHydrationWarning
          >
            {greeting}
          </h1>
          <p
            className="text-sm leading-snug text-white/40 capitalize"
            suppressHydrationWarning
          >
            {dateStr}
          </p>
        </div>
        <Link
          href="/settings"
          scroll={false}
          onClick={() => triggerInteractionFeedback({ haptic: false })}
          className="mt-0.5 flex size-11 h-max shrink-0 items-center justify-center rounded-lg text-white/45 transition-[transform,colors] duration-150 ease-out hover:bg-white/5 hover:text-white/75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.96]"
          aria-label="Customization and account"
        >
          <Settings className="size-5" aria-hidden />
        </Link>
      </div>

      {phrase ? (
        <p className="mt-3 min-w-0 leading-relaxed wrap-break-word">
          <span className="text-xs font-medium text-white/40">
            Motivation:{" "}
          </span>
          <span className="text-sm font-semibold text-white/78">{phrase}</span>
        </p>
      ) : null}
    </div>
  );
}
