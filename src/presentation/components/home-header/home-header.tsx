"use client";

import { useEffect, useState } from "react";

import { updateMotivationPhraseAction } from "@/app/actions/profile-actions";
import { signOutAction } from "@/app/actions/sign-out-action";
import { EditMotivationDialog } from "@/presentation/components/edit-motivation-dialog";
import { Button } from "@/presentation/components/ui/button";
import { patchDashboardMotivationPhrase } from "@/presentation/lib/dashboard-swr";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { getTimeAwareGreeting } from "@/presentation/lib/time-aware-greeting";

interface HomeHeaderProps {
  /** Maps to profile / `user_metadata.display_name`. */
  userName?: string;
  /** Seeds local state; maps to profile `motivation_phrase`. */
  initialMotivationPhrase?: string;
}

export function HomeHeader({
  userName = "there",
  initialMotivationPhrase = "",
}: HomeHeaderProps) {
  const [motivationPhrase, setMotivationPhrase] = useState(
    initialMotivationPhrase,
  );
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setMotivationPhrase(initialMotivationPhrase);
  }, [initialMotivationPhrase]);
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
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1
          className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-white"
          suppressHydrationWarning
        >
          {greeting}
        </h1>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="min-h-11 shrink-0 px-2 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70"
            onClick={() => triggerInteractionFeedback({ haptic: false })}
          >
            Sign out
          </Button>
        </form>
      </div>

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
        onSave={async (nextPhrase) => {
          const { error } = await updateMotivationPhraseAction(nextPhrase);
          if (error) {
            throw new Error(error);
          }
          setMotivationPhrase(nextPhrase);
          patchDashboardMotivationPhrase(nextPhrase);
        }}
      />
    </div>
  );
}
