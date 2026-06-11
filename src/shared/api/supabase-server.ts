import { createServerClient as createServerClientBase } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

/** Server Components, Server Actions, Route Handlers — never import from client code. */
export async function createServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClientBase<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Server Components may not mutate cookies */
        }
      },
    },
  });
}

/** Server-safe client without request cookies; suitable for static public pages. */
export function createPublicServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
