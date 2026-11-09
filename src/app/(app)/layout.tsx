import { redirect } from "next/navigation";

import { isAuthenticated } from "@/infrastructure/auth/auth-server";
import { TimezoneSyncProvider } from "@/presentation/components/timezone-sync";
import { DashboardProvider } from "@/presentation/lib/dashboard-context";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <DashboardProvider>
      <TimezoneSyncProvider />
      {children}
    </DashboardProvider>
  );
}
