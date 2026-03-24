import { Suspense } from "react";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell, LoginForm } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

function LoginFormFallback() {
  return (
    <div
      className="min-h-[280px] animate-pulse rounded-lg bg-muted/25"
      aria-hidden
    />
  );
}

export default async function LoginPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signInSubtitle")}
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
