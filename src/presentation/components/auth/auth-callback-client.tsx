"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { AuthShell } from "./auth-shell";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

function safeInternalNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/update-password";
  }
  return raw;
}

export function AuthCallbackClient() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    async function completeRecoverySession() {
      const url = new URL(window.location.href);

      if (url.searchParams.get("error")) {
        router.replace("/auth/recovery-expired");
        return;
      }

      const next = safeInternalNext(searchParams.get("next"));
      const code = url.searchParams.get("code");

      const { data: initialSession } = await supabase.auth.getSession();
      if (initialSession.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          router.refresh();
          return;
        }
      }

      const hash = window.location.hash?.replace(/^#/, "");
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) {
            window.history.replaceState(
              null,
              "",
              `${url.pathname}${url.search}`,
            );
            router.replace(next);
            router.refresh();
            return;
          }
        }
      }

      const { data: afterAttempts } = await supabase.auth.getSession();
      if (afterAttempts.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      router.replace("/auth/recovery-expired");
    }

    void completeRecoverySession();
  }, [router, searchParams]);

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      brandTagline={t("auth.brandTagline")}
      title={t("auth.callbackTitle")}
      subtitle={t("auth.callbackSubtitle")}
    >
      <div className="flex flex-col items-center gap-4 py-6">
        <div
          className="size-9 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-hidden
        />
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.callbackWorking")}
        </p>
      </div>
    </AuthShell>
  );
}
