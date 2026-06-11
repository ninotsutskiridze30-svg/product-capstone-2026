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
    { data: pending },
    { data: upcoming },
    { data: past },
    { data: cancelled },
  ] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, student_id, message, proposed_start, proposed_end, type, status, initiated_by, requested_slots")
      .eq("tutor_id", tutorId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_sessions")
      .select("id, student_id, status, type, created_at")
      .eq("tutor_id", tutorId)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: true }),
    supabase
      .from("lesson_sessions")
      .select("id, student_id, status, type, created_at")
      .eq("tutor_id", tutorId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("lesson_sessions")
      .select("id, student_id, status, type, created_at")
      .eq("tutor_id", tutorId)
      .eq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const ids = [
    ...new Set([
      ...(pending ?? []).map((p) => p.student_id),
      ...(upcoming ?? []).map((s) => s.student_id),
      ...(past ?? []).map((s) => s.student_id),
      ...(cancelled ?? []).map((s) => s.student_id),
    ]),
  ];

  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", ids)
      : { data: [] as { id: string; full_name: string | null }[] };

  const names = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Student"] as const)
  );

  return NextResponse.json({
    pending: (pending ?? []).map((b) => ({ ...b, peerName: names.get(b.student_id) ?? "Student" })),
    upcoming: (upcoming ?? []).map((s) => ({ ...s, peerName: names.get(s.student_id) ?? "Student" })),
    past: (past ?? []).map((s) => ({ ...s, peerName: names.get(s.student_id) ?? "Student" })),
    cancelled: (cancelled ?? []).map((s) => ({ ...s, peerName: names.get(s.student_id) ?? "Student" })),
  });
}
