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

  const tutorId = user.id;

  const [
    { data: events },
    { data: convs },
  ] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("id, title, start_time, end_time, type, color, is_recurring, recurrence_rule, recurrence_until")
      .eq("tutor_id", tutorId)
      .order("start_time", { ascending: true }),
    supabase
      .from("connections")
      .select("student_id")
      .eq("tutor_id", tutorId),
  ]);

  const studentIds = [...new Set((convs ?? []).map((c) => c.student_id))];
  const { data: studentProfiles } =
    studentIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : { data: [] as { id: string; full_name: string | null }[] };

  return NextResponse.json({
    tutorId,
    events: events ?? [],
    connectedStudents: (studentProfiles ?? []).map((p) => ({
      id: p.id,
      name: p.full_name ?? "Student",
    })),
  });
}
