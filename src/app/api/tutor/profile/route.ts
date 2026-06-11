import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServerClient } from "@/shared/api/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: tutor }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, bio, phone, city, country")
      .eq("id", user.id)
      .single(),
    supabase
      .from("tutor_profiles")
      .select("headline, hourly_rate_min, hourly_rate_max, experience_years, languages, website_url, linkedin_url, education, certifications")
      .eq("id", user.id)
      .single(),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3002";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const publicUrl = `${proto}://${host}/tutors/${user.id}`;

  return NextResponse.json({ profile, tutor, publicUrl, userId: user.id });
}
