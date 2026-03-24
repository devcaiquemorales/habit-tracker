"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/app/actions/sign-out-action";
import { Button } from "@/presentation/components/ui/button";

function SignOutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      loading={pending}
      loadingText="Signing out..."
      className="min-h-11 w-full justify-center gap-2 sm:w-auto"
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      Sign out
    </Button>
  );
}

export function SignOutForm({ className }: { className?: string }) {
  return (
    <form action={signOutAction} className={className}>
      <SignOutSubmitButton />
    </form>
  );
}
