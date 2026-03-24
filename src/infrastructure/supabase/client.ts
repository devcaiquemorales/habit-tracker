"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/infrastructure/supabase/database.types";
import { getSupabasePublicEnv } from "@/infrastructure/supabase/env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
