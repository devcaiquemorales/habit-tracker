import { getServerAppLocale } from "@/lib/get-server-app-locale";
import {
  AuthShell,
  UpdatePasswordForm,
} from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function UpdatePasswordPage() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return (
    <AuthShell
      brandLabel={t("auth.brandName")}
      brandTagline={t("auth.brandTagline")}
      title={t("auth.updatePasswordTitle")}
      subtitle={t("auth.updatePasswordSubtitle")}
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
