"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { authClient } from "@/infrastructure/auth/auth-client";
import { AuthFormNotice } from "@/presentation/components/auth/auth-form-notice";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { safeNextPath } from "@/presentation/lib/safe-next-path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetHint =
    searchParams.get("reset") === "success"
      ? t("auth.resetCompleteSignIn")
      : searchParams.get("verified") === "1"
        ? t("auth.emailVerifiedSignIn")
        : null;

  const emailValid = EMAIL_RE.test(email.trim());

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!emailValid || password.length === 0) {
      setError(t("authErrors.invalidCredentials"));
      return;
    }
    setError(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const { error: authError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthErrorMessage(authError, t));
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {resetHint ? (
        <AuthFormNotice variant="success">{resetHint}</AuthFormNotice>
      ) : null}
      {error ? <AuthFormNotice variant="error">{error}</AuthFormNotice> : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">{t("auth.email")}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={loading}
          aria-invalid={email.length > 0 && !emailValid}
        />
        {email.length > 0 && !emailValid ? (
          <p className="text-xs text-destructive">{t("auth.validEmail")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t("auth.password")}</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-full"
        loading={loading}
        loadingText={t("common.signingIn")}
      >
        {t("auth.signIn")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.inviteOnlyNote")}
      </p>

      <p className="text-center">
        <Link
          href="/forgot-password"
          className="text-[15px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t("auth.forgotPasswordLink")}
        </Link>
      </p>
    </form>
  );
}
