"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { authClient } from "@/infrastructure/auth/auth-client";
import { AuthFormNotice } from "@/presentation/components/auth/auth-form-notice";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOTIVATION_MAX = 120;

export function SignupForm() {
  const { t } = useI18n();
  const invitedEmail = useSearchParams().get("email") ?? "";
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState("");
  const [motivationPhrase, setMotivationPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const nameOk = displayName.trim().length >= 1;
  const motivationOk = motivationPhrase.trim().length >= 1;
  const passwordOk = password.length >= 8;
  const canSubmit =
    nameOk && emailValid && passwordOk && motivationOk && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const { error: signUpError } = await authClient.signUp.email({
      name: displayName.trim(),
      email: email.trim(),
      password,
      callbackURL: "/login?verified=1",
      // Read by the sign-up hook in convex/auth.ts to seed the profile.
      motivationPhrase: motivationPhrase.trim().slice(0, MOTIVATION_MAX),
    } as Parameters<typeof authClient.signUp.email>[0]);

    setLoading(false);

    if (signUpError) {
      setError(formatAuthErrorMessage(signUpError, t));
      return;
    }

    setInfo(t("auth.checkInboxSignup"));
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {error ? <AuthFormNotice variant="error">{error}</AuthFormNotice> : null}
      {info ? <AuthFormNotice variant="info">{info}</AuthFormNotice> : null}

      <div className="space-y-2">
        <Label htmlFor="signup-name">{t("auth.displayName")}</Label>
        <Input
          id="signup-name"
          name="displayName"
          autoComplete="name"
          value={displayName}
          onChange={(ev) => setDisplayName(ev.target.value)}
          disabled={loading}
          placeholder={t("auth.displayNamePlaceholder")}
          aria-invalid={displayName.length > 0 && !nameOk}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">{t("auth.email")}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={loading}
          placeholder={t("auth.emailPlaceholder")}
          aria-invalid={email.length > 0 && !emailValid}
        />
        {email.length > 0 && !emailValid ? (
          <p className="text-xs text-destructive">{t("auth.validEmail")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">{t("auth.password")}</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
          placeholder={t("auth.passwordMinPlaceholder")}
          aria-invalid={password.length > 0 && !passwordOk}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-reason">{t("auth.yourReason")}</Label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("auth.reasonFieldHint")}
        </p>
        <Input
          id="signup-reason"
          name="motivationPhrase"
          autoComplete="off"
          value={motivationPhrase}
          onChange={(ev) =>
            setMotivationPhrase(ev.target.value.slice(0, MOTIVATION_MAX))
          }
          disabled={loading}
          placeholder={t("auth.motivationPlaceholder")}
          aria-invalid={motivationPhrase.length > 0 && !motivationOk}
        />
        <p className="text-xs tabular-nums text-muted-foreground/90">
          {motivationPhrase.length}/{MOTIVATION_MAX}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-full"
        loading={loading}
        loadingText={t("auth.creatingAccount")}
        disabled={!canSubmit}
      >
        {t("auth.createAccount")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary/95 underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {t("auth.signInLink")}
        </Link>
      </p>
    </form>
  );
}
