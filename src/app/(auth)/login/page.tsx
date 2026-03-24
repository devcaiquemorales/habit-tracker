import { Suspense } from "react";

import { AuthShell, LoginForm } from "@/presentation/components/auth";

function LoginFormFallback() {
  return (
    <div
      className="min-h-[280px] animate-pulse rounded-lg bg-muted/25"
      aria-hidden
    />
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue tracking your habits."
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
