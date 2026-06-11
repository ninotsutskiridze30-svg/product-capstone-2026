import { NextResponse } from "next/server";

import { createServerClient } from "@/shared/api/supabase-server";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city, country, bio, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "tutor") {
    return NextResponse.json({ status: "wrong_role" });
  }

  return NextResponse.json({
    status: "pending",
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      country: profile?.country ?? "",
      bio: profile?.bio ?? "",
    },
  });
}
