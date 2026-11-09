"use client";

import { ArrowLeft, Bell, Check, Shield, SunMoon, User } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "@/domain/constants/profile-limits";
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
      <header className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/90 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:-mx-6 tablet:-mx-6">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 md:px-6 tablet:px-6">
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
          <h1 className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-foreground">
            {t("settings.title")}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 pt-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <section className="rounded-[1.5rem] bg-sidebar p-5">
            <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">
                {t("settings.profileSection")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="settings-display-name" className="text-foreground/80">
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
                <p className="text-xs text-muted-foreground/70">
                  {displayName.length}/{PROFILE_DISPLAY_NAME_MAX}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-motivation" className="text-foreground/80">
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
                <p className="text-xs text-muted-foreground/70">
                  {motivationPhrase.length}/{PROFILE_MOTIVATION_PHRASE_MAX}
                </p>
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

        <section className="rounded-[1.5rem] bg-sidebar p-5">
          <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
            <SunMoon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-muted-foreground">
              {t("settings.appearanceSection")}
            </p>
          </div>
          <ThemeSelector />
        </section>

        {children && (
          <section className="rounded-[1.5rem] bg-sidebar p-5">
            <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
              <Bell className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">
                {t("settings.remindersSection")}
              </p>
            </div>
            <div className="[&>section]:!space-y-0 [&>section>div:first-child]:!mb-0 [&>section>div:first-child]:!border-b-0 [&>section>div:first-child]:!pb-0 [&>section>h2]:!hidden [&>section>p:first-of-type]:!hidden">
              {children}
            </div>
          </section>
        )}

        <section className="rounded-[1.5rem] bg-sidebar p-5">
          <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-muted-foreground">
              {t("settings.accountSection")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {userEmail && (
              <div className="space-y-1">
                <Label className="text-foreground/80">
                  {t("settings.email")}
                </Label>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            )}
            <SignOutForm />
          </div>
        </section>
      </div>
    </main>
  );
}
