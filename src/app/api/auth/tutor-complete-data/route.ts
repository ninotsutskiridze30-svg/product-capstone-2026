import { NextResponse } from "next/server";

import { createServerClient } from "@/shared/api/supabase-server";
import { loadFieldCategoriesForTutorSignup } from "@/features/auth/tutor-register-data";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingTutor } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingTutor) {
    return NextResponse.json({ status: "complete" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const categories = await loadFieldCategoriesForTutorSignup();

  return NextResponse.json({
    status: "pending",
    defaultFullName: profile?.full_name ?? "",
    categories,
  });
}
