import { Suspense } from "react";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell, LoginForm } from "@/presentation/components/auth";
import { AuthShellSkeleton } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function LoginPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      brandTagline={t("auth.brandTagline")}
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signInSubtitle")}
    >
      <Suspense fallback={<AuthShellSkeleton statusLabel={t("common.loading")} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
