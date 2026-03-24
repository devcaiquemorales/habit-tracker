import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShell, SignupForm } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function SignupPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      title={t("auth.createAccountTitle")}
      subtitle={t("auth.createAccountSubtitle")}
    >
      <SignupForm />
    </AuthShell>
  );
}
