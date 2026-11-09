import { getServerAppLocale } from "@/lib/get-server-app-locale";
import {
  AuthShell,
  ForgotPasswordForm,
} from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function ForgotPasswordPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      title={t("auth.forgotPasswordTitle")}
      subtitle={t("auth.forgotPasswordSubtitle")}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
