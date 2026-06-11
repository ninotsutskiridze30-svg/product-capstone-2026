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

  const studentId = user.id;

  const [
    { data: pendingReq },
    { data: upcoming },
    { data: past },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, tutor_id, status, proposed_start, proposed_end, type, message, initiated_by, requested_slots")
      .eq("student_id", studentId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_sessions")
      .select("id, tutor_id, status, type, created_at")
      .eq("student_id", studentId)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: true }),
    supabase
      .from("lesson_sessions")
      .select("id, tutor_id, status, created_at")
      .eq("student_id", studentId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("reviews")
      .select("session_id")
      .eq("student_id", studentId),
  ]);

  const ids = [
    ...new Set([
      ...(pendingReq ?? []).map((r) => r.tutor_id),
      ...(upcoming ?? []).map((s) => s.tutor_id),
      ...(past ?? []).map((s) => s.tutor_id),
    ]),
  ];

  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", ids)
      : { data: [] as { id: string; full_name: string | null }[] };

  const names = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Tutor"] as const)
  );

  return NextResponse.json({
    pendingRequests: (pendingReq ?? []).map((r) => ({ ...r, peerName: names.get(r.tutor_id) ?? "Tutor" })),
    upcoming: (upcoming ?? []).map((s) => ({ ...s, peerName: names.get(s.tutor_id) ?? "Tutor" })),
    past: (past ?? []).map((s) => ({ ...s, peerName: names.get(s.tutor_id) ?? "Tutor" })),
    reviewedSessionIds: (reviews ?? []).map((r) => r.session_id),
  });
}
