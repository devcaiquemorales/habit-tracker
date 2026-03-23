"use client";

import { useState } from "react";

import { EditMotivationDialog } from "@/presentation/components/edit-motivation-dialog";
import { MOCK_USER_PROFILE } from "@/presentation/data/mock-user-profile";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { getTimeAwareGreeting } from "@/presentation/lib/time-aware-greeting";

interface HomeHeaderProps {
  /** Maps to `UserProfile.displayName` for future auth. */
  userName?: string;
  /** Seeds local state; maps to `UserProfile.motivationPhrase`. */
  initialMotivationPhrase?: string;
}

export function HomeHeader({
  userName = MOCK_USER_PROFILE.displayName,
  initialMotivationPhrase = MOCK_USER_PROFILE.motivationPhrase,
}: HomeHeaderProps) {
  const [motivationPhrase, setMotivationPhrase] = useState(
    initialMotivationPhrase,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [motivationFormResetKey, setMotivationFormResetKey] = useState(0);

  const [greeting] = useState(() =>
    getTimeAwareGreeting(userName, new Date()),
  );
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-2">
      <h1
        className="text-2xl font-bold tracking-tight text-white"
        suppressHydrationWarning
      >
        {greeting}
      </h1>

      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
        <p
          className="min-w-0 text-sm leading-relaxed text-white/40"
          suppressHydrationWarning
        >
          <span className="capitalize">{dateStr}</span>
          <span> · </span>
          <span className="wrap-break-word">{motivationPhrase}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            triggerInteractionFeedback();
            setMotivationFormResetKey((k) => k + 1);
            setEditOpen(true);
          }}
          className="shrink-0 self-start text-left text-xs font-medium text-white/35 underline-offset-2 transition-colors hover:text-white/55 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:self-auto"
        >
          Edit reason
        </button>
      </div>

      <EditMotivationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        formResetKey={motivationFormResetKey}
        motivationPhrase={motivationPhrase}
        onSave={setMotivationPhrase}
      />
    </div>
  );
}
