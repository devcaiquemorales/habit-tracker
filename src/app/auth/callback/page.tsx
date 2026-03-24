import { Suspense } from "react";

import { AuthShellSkeleton } from "@/presentation/components/auth";
import { AuthCallbackClient } from "@/presentation/components/auth/auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={<AuthShellSkeleton statusLabel="Verifying link…" />}
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
