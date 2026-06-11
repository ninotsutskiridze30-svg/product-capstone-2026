import { NextResponse } from "next/server";
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

  const [{ data: groups }, { data: fields }] = await Promise.all([
    supabase
      .from("student_groups")
      .select("id, name, max_students, current_count, description, is_active, field_id")
      .eq("tutor_id", user.id)
      .order("name"),
    supabase.from("fields").select("id, name").order("name"),
  ]);

  const fieldName = new Map(
    (fields ?? []).map((f) => [f.id, f.name] as const)
  );

  return NextResponse.json({
    tutorId: user.id,
    groups: (groups ?? []).map((g) => ({
      ...g,
      fieldName: fieldName.get(g.field_id) ?? "Subject",
    })),
    fields: fields ?? [],
  });
}
