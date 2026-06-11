import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/types/database.types";

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server code
 * (background jobs, signed-URL minting). Never expose to the browser. Mirrors the
 * pattern in src/app/api/upload/route.ts.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Server missing Supabase configuration (URL or service role key)"
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
