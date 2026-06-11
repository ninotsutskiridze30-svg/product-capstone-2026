import { NextResponse } from "next/server";

import { createServerClient } from "@/shared/api/supabase";
import type { UserRole } from "@/shared/types/database.types";

export type AuthContext = {
  userId: string;
  role: UserRole | null;
};

export async function requireAuth(
  expectedRole?: UserRole
): Promise<{ auth: AuthContext } | { response: NextResponse<{ error: string }> }> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? null;

  if (expectedRole && role !== expectedRole) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return {
    auth: {
      userId: user.id,
      role,
    },
  };
}
