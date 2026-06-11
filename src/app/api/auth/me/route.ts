import { NextResponse } from "next/server";

import { getCurrentUserForRequest } from "@/entities/user/api/current-user.server";
import { createServerClient } from "@/shared/api/supabase-server";

export async function GET() {
  const supabase = await createServerClient();
  const body = await getCurrentUserForRequest(supabase);
  return NextResponse.json(body);
}
