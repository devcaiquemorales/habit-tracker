import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { AuthShellSkeleton } from "@/presentation/components/auth";
import { createTranslator, getMessages } from "@/presentation/lib/i18n/messages";

export default async function AuthLoading() {
  const locale = await getServerAppLocale();
  const t = createTranslator(getMessages(locale));

  return <AuthShellSkeleton statusLabel={t("common.loading")} />;
}
