"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { updateProfileCustomizationAction } from "@/app/actions/profile-actions";
import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "@/domain/constants/profile-limits";
import { SignOutForm } from "@/presentation/components/sign-out-form";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatActionError } from "@/presentation/lib/action-error";
import { patchDashboardProfile } from "@/presentation/lib/dashboard-swr";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

type CustomizationScreenProps = {
  initialDisplayName: string;
  initialMotivationPhrase: string;
};

export function CustomizationScreen({
  initialDisplayName,
  initialMotivationPhrase,
}: CustomizationScreenProps) {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [motivationPhrase, setMotivationPhrase] = useState(
    initialMotivationPhrase,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setMotivationPhrase(initialMotivationPhrase);
  }, [initialDisplayName, initialMotivationPhrase]);

  const trimmedName = displayName.trim();
  const trimmedMotivation = motivationPhrase.trim();
  const canSave =
    trimmedName.length > 0 &&
    trimmedMotivation.length > 0 &&
    trimmedName.length <= PROFILE_DISPLAY_NAME_MAX &&
    motivationPhrase.length <= PROFILE_MOTIVATION_PHRASE_MAX &&
    !saving;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaveError(null);
    setSaving(true);
    try {
      const nextMotivation = motivationPhrase
        .trim()
        .slice(0, PROFILE_MOTIVATION_PHRASE_MAX);
      const result = await updateProfileCustomizationAction({
        displayName: trimmedName.slice(0, PROFILE_DISPLAY_NAME_MAX),
        motivationPhrase: nextMotivation,
      });
      const errMsg = formatActionError(result, t);
      if (errMsg) {
        setSaveError(errMsg);
        return;
      }
      patchDashboardProfile({
        displayName: trimmedName.slice(0, PROFILE_DISPLAY_NAME_MAX),
        motivationPhrase: nextMotivation,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh max-w-lg flex-col",
        "pb-[calc(2rem+env(safe-area-inset-bottom,0px))]",
        "pt-[env(safe-area-inset-top,0px)]",
        "pl-[calc(1rem+env(safe-area-inset-left,0px))]",
        "pr-[calc(1rem+env(safe-area-inset-right,0px))]",
        "md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))]",
        "md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))]",
      )}
    >
      <header
        className="sticky z-10 -mx-4 border-b border-white/10 bg-background/90 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:-mx-6"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 md:px-6">
          <Link
            href="/"
            scroll={false}
            onClick={() => triggerInteractionFeedback()}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white/75 transition-[transform,colors] duration-150 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.96]"
            aria-label={t("settings.backHomeAria")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-white">
            {t("settings.title")}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 pt-8">
        <p className="text-sm leading-relaxed text-white/45">{t("settings.intro")}</p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="settings-display-name" className="text-white/70">
              {t("settings.displayName")}
            </Label>
            <Input
              id="settings-display-name"
              name="displayName"
              value={displayName}
              onChange={(ev) =>
                setDisplayName(
                  ev.target.value.slice(0, PROFILE_DISPLAY_NAME_MAX),
                )
              }
              autoComplete="name"
              className="min-h-11 text-base sm:min-h-10 sm:text-sm"
              aria-invalid={
                trimmedName.length > PROFILE_DISPLAY_NAME_MAX || undefined
              }
            />
            <p className="text-xs text-white/35">
              {displayName.length}/{PROFILE_DISPLAY_NAME_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-motivation" className="text-white/70">
              {t("settings.yourReason")}
            </Label>
            <Input
              id="settings-motivation"
              name="motivationPhrase"
              value={motivationPhrase}
              onChange={(ev) =>
                setMotivationPhrase(
                  ev.target.value.slice(0, PROFILE_MOTIVATION_PHRASE_MAX),
                )
              }
              placeholder={t("settings.reasonPlaceholder")}
              className="min-h-11 text-base sm:min-h-10 sm:text-sm"
            />
            <p className="text-xs text-white/35">
              {motivationPhrase.length}/{PROFILE_MOTIVATION_PHRASE_MAX}
            </p>
          </div>

          {saveError ? (
            <p className="text-sm text-red-400/90" role="alert">
              {saveError}
            </p>
          ) : null}

          <Button
            type="submit"
            loading={saving}
            loadingText={t("settings.saving")}
            disabled={!canSave}
            className="min-h-11 w-full sm:w-auto"
          >
            {t("settings.saveChanges")}
          </Button>
        </form>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-8">
          <p className="text-xs font-medium tracking-wide text-white/35 uppercase">
            {t("settings.account")}
          </p>
          <SignOutForm />
        </div>
      </div>
    </main>
  );
}
