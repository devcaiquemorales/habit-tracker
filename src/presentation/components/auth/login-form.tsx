"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { AuthFormNotice } from "@/presentation/components/auth/auth-form-notice";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetHint =
    searchParams.get("reset") === "success"
      ? t("auth.resetCompleteSignIn")
      : null;

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && password.length >= 6 && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthErrorMessage(authError.message, t));
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/");
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
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder={t("auth.emailPlaceholder")}
          aria-invalid={email.length > 0 && !emailValid}
        />
        {email.length > 0 && !emailValid ? (
          <p className="text-xs text-destructive">{t("auth.validEmail")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <Label htmlFor="login-password">{t("auth.password")}</Label>
          <Link
            href="/forgot-password"
            className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("auth.forgotPasswordLink")}
          </Link>
        </div>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder={t("auth.passwordPlaceholder")}
          aria-invalid={password.length > 0 && password.length < 6}
        />
        {password.length > 0 && password.length < 6 ? (
          <p className="text-xs text-muted-foreground">{t("auth.passwordMin")}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="min-h-11 w-full min-w-0"
        loading={loading}
        loadingText={t("common.signingIn")}
        disabled={!canSubmit}
      >
        {t("auth.signIn")}
      </Button>

      <p className="border-t border-white/5 pt-5 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary/95 underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {t("auth.createOne")}
        </Link>
      </p>
    </form>
  );
}
