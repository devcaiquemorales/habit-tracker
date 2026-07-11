"use client";

import { ArrowLeft, Check, Shield, User } from "lucide-react";
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
  userEmail?: string | null;
  children?: React.ReactNode;
};

export function CustomizationScreen({
  initialDisplayName,
  initialMotivationPhrase,
  userEmail,
  children,
}: CustomizationScreenProps) {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [motivationPhrase, setMotivationPhrase] = useState(
    initialMotivationPhrase,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setMotivationPhrase(initialMotivationPhrase);
  }, [initialDisplayName, initialMotivationPhrase]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [saved]);

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
      setSaved(true);
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
        "pl-[calc(1rem+env(safe-area-inset-left,0px))]",
        "pr-[calc(1rem+env(safe-area-inset-right,0px))]",
        "md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))]",
        "md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))]",
      )}
    >
      <header className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-background/90 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:-mx-6">
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

      <div className="flex flex-1 flex-col gap-4 pt-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <section className="rounded-xl bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <User className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
              <p className="text-xs font-medium tracking-wide uppercase text-white/40">
                {t("settings.profileSection")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
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
                className={cn(
                  "min-h-11 w-full transition-colors",
                  saved && "bg-green-500/80 hover:bg-green-500/70",
                )}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    {t("settings.saved")}
                  </>
                ) : (
                  t("settings.saveChanges")
                )}
              </Button>
            </div>
          </section>
        </form>

        {children && (
          <section className="rounded-xl bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <svg
                className="h-4 w-4 shrink-0 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-medium tracking-wide uppercase text-white/40">
                {t("settings.remindersSection")}
              </p>
            </div>
            <div className="[&>section]:!space-y-0 [&>section>div:first-child]:!mb-0 [&>section>div:first-child]:!border-b-0 [&>section>div:first-child]:!pb-0 [&>section>h2]:!hidden [&>section>p:first-of-type]:!hidden">
              {children}
            </div>
          </section>
        )}

        <section className="rounded-xl bg-white/5 p-4">
          <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Shield className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
            <p className="text-xs font-medium tracking-wide uppercase text-white/40">
              {t("settings.accountSection")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {userEmail && (
              <div className="space-y-1">
                <Label className="text-white/70">
                  {t("settings.email")}
                </Label>
                <p className="text-sm text-white/50">{userEmail}</p>
              </div>
            )}
            <SignOutForm />
          </div>
        </section>
      </div>
    </main>
  );
}
