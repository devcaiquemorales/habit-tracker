import Link from "next/link";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell } from "@/presentation/components/auth";
import { Button } from "@/presentation/components/ui/button";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function RecoveryExpiredPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      brandTagline={t("auth.brandTagline")}
      title={t("auth.recoveryExpiredTitle")}
      subtitle={t("auth.recoveryExpiredSubtitle")}
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <Button asChild size="lg" className="min-h-11 w-full">
          <Link href="/forgot-password">{t("auth.recoveryExpiredCtaForgot")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="min-h-11 w-full">
          <Link href="/login">{t("auth.backToSignIn")}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
