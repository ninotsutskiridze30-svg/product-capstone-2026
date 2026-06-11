import type { SupabaseClient } from "@supabase/supabase-js";

import type { CurrentUserResponse } from "./user.api";
import type { Database } from "@/shared/types/database.types";

/** Server-only: same payload as GET /api/auth/me. */
export async function getCurrentUserForRequest(
  supabase: SupabaseClient<Database>
): Promise<CurrentUserResponse> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      role: profile?.role ?? null,
    },
  };
}
