"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useSyncExternalStore } from "react";

import { authClient } from "@/infrastructure/auth/auth-client";
import { AuthFormNotice } from "@/presentation/components/auth/auth-form-notice";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

const subscribeNoop = () => () => {};

function readResetToken(): string | null {
  return new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
}

export function UpdatePasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  // Undefined until hydrated: the token lives in the fragment, which only the browser sees.
  const token = useSyncExternalStore(
    subscribeNoop,
    readResetToken,
    () => undefined,
  );
  const sessionReady = token !== undefined;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordOk = password.length >= 8;
  const match = password === confirm && confirm.length > 0;
  const canSubmit =
    sessionReady && token && passwordOk && match && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const { error: updateError } = await authClient.resetPassword({
      newPassword: password,
      token: token as string,
    });

    if (updateError) {
      setLoading(false);
      if (updateError.code === "INVALID_TOKEN") {
        router.replace("/auth/recovery-expired");
        return;
      }
      setError(formatAuthErrorMessage(updateError, t));
      return;
    }

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

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <AuthFormNotice variant="info">
          {t("auth.recoveryLinkInvalid")}
        </AuthFormNotice>
        <Button asChild size="lg" className="h-11 w-full rounded-full">
          <Link href="/forgot-password">{t("auth.requestNewResetLink")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-full">
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
        className="h-11 w-full rounded-full"
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
