import { redirect } from "next/navigation";

import { isAuthenticated } from "@/infrastructure/auth/auth-server";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">{children}</div>
  );
}
