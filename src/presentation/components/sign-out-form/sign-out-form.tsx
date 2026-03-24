"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/app/actions/sign-out-action";
import { Button } from "@/presentation/components/ui/button";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

function SignOutSubmitButton({
  signingOutLabel,
  signOutLabel,
}: {
  signingOutLabel: string;
  signOutLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      loading={pending}
      loadingText={signingOutLabel}
      className="min-h-11 w-full justify-center gap-2 sm:w-auto"
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {signOutLabel}
    </Button>
  );
}

export function SignOutForm({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <form action={signOutAction} className={className}>
      <SignOutSubmitButton
        signingOutLabel={t("common.signingOut")}
        signOutLabel={t("common.signOut")}
      />
    </form>
  );
}
