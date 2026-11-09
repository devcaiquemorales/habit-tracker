import { Suspense } from "react";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell, AuthShellSkeleton, SignupForm } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function SignupPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      title={t("auth.createAccountTitle")}
      subtitle={t("auth.createAccountSubtitle")}
    >
      <Suspense fallback={<AuthShellSkeleton statusLabel={t("common.loading")} />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
