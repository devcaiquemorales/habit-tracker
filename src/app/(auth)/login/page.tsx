import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell, AuthShellSkeleton, LoginForm } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error === "recovery") {
    redirect("/auth/recovery-expired");
  }

  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      title={t("auth.brandName")}
      subtitle={t("auth.signInShort")}
    >
      <Suspense fallback={<AuthShellSkeleton statusLabel={t("common.loading")} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
