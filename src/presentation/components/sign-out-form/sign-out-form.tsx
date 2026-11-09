"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/infrastructure/auth/auth-client";
import { Button } from "@/presentation/components/ui/button";
import { clearDashboardCache } from "@/presentation/lib/dashboard-cache";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

export function SignOutForm({ className }: { className?: string }) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    await authClient.signOut();
    clearDashboardCache();
    // A full load drops the live subscription along with the old session.
    window.location.assign("/login");
  };

  return (
    <div className={cn(className, "w-full")}>
      <Button
        type="button"
        variant="destructive"
        loading={pending}
        loadingText={t("common.signingOut")}
        className="h-11 w-full justify-center gap-2 rounded-full md:h-9"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        {t("common.signOut")}
      </Button>
    </div>
  );
}
