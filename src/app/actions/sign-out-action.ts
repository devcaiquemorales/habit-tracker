"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
