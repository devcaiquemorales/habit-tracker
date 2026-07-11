import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { TimezoneSyncProvider } from "@/presentation/components/timezone-sync";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <TimezoneSyncProvider />
      {children}
    </>
  );
}
