"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { AuthFormNotice } from "@/presentation/components/auth/auth-form-notice";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

export function UpdatePasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session);
      setSessionReady(true);
    });
  }, []);

  const passwordOk = password.length >= 6;
  const match = password === confirm && confirm.length > 0;
  const canSubmit =
    sessionReady && hasRecoverySession && passwordOk && match && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setLoading(false);
      setError(formatAuthErrorMessage(updateError.message, t));
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login?reset=success");
    router.refresh();
  }

  if (!sessionReady) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div
          className="size-9 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="flex flex-col gap-5">
        <AuthFormNotice variant="info">
          {t("auth.recoveryLinkInvalid")}
        </AuthFormNotice>
        <Button asChild size="lg" className="min-h-11 w-full">
          <Link href="/forgot-password">{t("auth.requestNewResetLink")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="min-h-11 w-full">
          <Link href="/login">{t("auth.backToSignIn")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {error ? <AuthFormNotice variant="error">{error}</AuthFormNotice> : null}

      <div className="space-y-2">
        <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder={t("auth.passwordMinPlaceholder")}
          aria-invalid={password.length > 0 && !passwordOk}
        />
        {password.length > 0 && !passwordOk ? (
          <p className="text-xs text-muted-foreground">{t("auth.passwordMin")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder={t("auth.passwordPlaceholder")}
          aria-invalid={confirm.length > 0 && !match}
        />
        {confirm.length > 0 && !match ? (
          <p className="text-xs text-destructive">{t("auth.confirmPasswordMismatch")}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="min-h-11 w-full min-w-0"
        loading={loading}
        loadingText={t("auth.updatingPassword")}
        disabled={!canSubmit}
      >
        {t("auth.updatePasswordSubmit")}
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
