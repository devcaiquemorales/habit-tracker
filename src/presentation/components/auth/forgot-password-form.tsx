"use client";

import Link from "next/link";
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

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && !loading && !success;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const { error: resetError } = await authClient.requestPasswordReset({
      email: email.trim(),
    });

    setLoading(false);

    if (resetError) {
      setError(formatAuthErrorMessage(resetError, t));
      return;
    }

    setSuccess(true);
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {error ? <AuthFormNotice variant="error">{error}</AuthFormNotice> : null}
      {success ? (
        <AuthFormNotice variant="success">{t("auth.forgotPasswordSuccess")}</AuthFormNotice>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="forgot-email">{t("auth.email")}</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={loading || success}
          placeholder={t("auth.emailPlaceholder")}
          aria-invalid={email.length > 0 && !emailValid}
        />
        {email.length > 0 && !emailValid ? (
          <p className="text-xs text-destructive">{t("auth.validEmail")}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-full"
        loading={loading}
        loadingText={t("auth.forgotPasswordSending")}
        disabled={!canSubmit}
      >
        {t("auth.forgotPasswordSubmit")}
      </Button>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t("auth.backToSignIn")}
        </Link>
      </p>
    </form>
  );
}
