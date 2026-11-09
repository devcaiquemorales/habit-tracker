"use client";

import { ArrowLeft, Bell, Check, Shield, SunMoon, User } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "@/domain/constants/profile-limits";
import { SettingsSection } from "@/presentation/components/customization-screen/settings-section";
import { SignOutForm } from "@/presentation/components/sign-out-form";
import { ThemeSelector } from "@/presentation/components/theme-selector";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { formatActionError } from "@/presentation/lib/action-error";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

/** Counters only earn their space once the limit is close. */
function nearLimit(length: number, max: number): boolean {
  return length >= max * 0.8;
}

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
  const { updateProfile } = useDashboardMutations();
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
    (trimmedName !== initialDisplayName.trim() ||
      trimmedMotivation !== initialMotivationPhrase.trim()) &&
    !saving;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaveError(null);
    setSaving(true);
    try {
      const result = await updateProfile(
        trimmedName.slice(0, PROFILE_DISPLAY_NAME_MAX),
        trimmedMotivation.slice(0, PROFILE_MOTIVATION_PHRASE_MAX),
      );
      const errMsg = formatActionError(result, t);
      if (errMsg) {
        setSaveError(errMsg);
        return;
      }
      setSaved(true);
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
        "md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] tablet:pl-[calc(1.5rem+env(safe-area-inset-left,0px))]",
        "md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] tablet:pr-[calc(1.5rem+env(safe-area-inset-right,0px))]",
      )}
    >
      <header className="sticky top-0 z-10 -mx-4 bg-background/90 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:-mx-6 tablet:-mx-6">
        <div className="mx-auto grid max-w-lg grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 px-4 md:px-6 tablet:px-6">
          <Link
            href="/"
            prefetch
            scroll={false}
            onClick={() => triggerInteractionFeedback()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px md:size-8"
            aria-label={t("settings.backHomeAria")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="min-w-0 truncate text-center text-lg font-semibold tracking-tight text-foreground">
            {t("settings.title")}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 pt-4">
        <form onSubmit={(e) => void handleSubmit(e)}>
          <SettingsSection title={t("settings.profileSection")} icon={User}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="settings-display-name">
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
                  aria-invalid={
                    trimmedName.length > PROFILE_DISPLAY_NAME_MAX || undefined
                  }
                />
                {nearLimit(displayName.length, PROFILE_DISPLAY_NAME_MAX) ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {displayName.length}/{PROFILE_DISPLAY_NAME_MAX}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-motivation">
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
                />
                {nearLimit(
                  motivationPhrase.length,
                  PROFILE_MOTIVATION_PHRASE_MAX,
                ) ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {motivationPhrase.length}/{PROFILE_MOTIVATION_PHRASE_MAX}
                  </p>
                ) : null}
              </div>

              {saveError ? (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              ) : null}

              <Button
                type="submit"
                loading={saving}
                loadingText={t("settings.saving")}
                disabled={!canSave}
                className="h-11 w-full rounded-full md:h-9"
              >
                {saved ? (
                  <>
                    <Check aria-hidden />
                    {t("settings.saved")}
                  </>
                ) : (
                  t("settings.saveChanges")
                )}
              </Button>
            </div>
          </SettingsSection>
        </form>

        <SettingsSection title={t("settings.appearanceSection")} icon={SunMoon}>
          <ThemeSelector />
        </SettingsSection>

        {children ? (
          <SettingsSection title={t("settings.remindersSection")} icon={Bell}>
            {children}
          </SettingsSection>
        ) : null}

        <SettingsSection title={t("settings.accountSection")} icon={Shield}>
          <div className="flex flex-col gap-4">
            {userEmail ? (
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="shrink-0 text-muted-foreground">
                  {t("settings.email")}
                </span>
                <span className="min-w-0 truncate text-foreground">
                  {userEmail}
                </span>
              </div>
            ) : null}
            <SignOutForm />
          </div>
        </SettingsSection>
      </div>
    </main>
  );
}
