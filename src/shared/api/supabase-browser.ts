import { createBrowserClient as createBrowserClientBase } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/types/database.types";

function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return { url, anonKey };
}

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Browser / Client Components — use only in `"use client"` modules.
 *
 * Returns a per-tab singleton so the whole app shares ONE Realtime socket and
 * ONE auth session. Multiple instances would each open their own websocket and
 * race on the auth token, which breaks RLS-scoped Realtime delivery.
 */
export function createBrowserClient(): SupabaseClient<Database> {
  // SSR safety: never memoize on the server — each render gets a throwaway client.
  if (typeof window === "undefined") {
    const { url, anonKey } = getSupabaseConfig();
    return createBrowserClientBase<Database>(url, anonKey);
  }
  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createBrowserClientBase<Database>(url, anonKey);
  }
  return browserClient;
}
