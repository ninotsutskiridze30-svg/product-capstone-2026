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
    { data: sessions },
    { data: requests },
    { data: favs },
  ] = await Promise.all([
    supabase
      .from("lesson_sessions")
      .select("id, tutor_id, status, type, created_at")
      .eq("student_id", studentId)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: true })
      .limit(5),
    supabase
      .from("booking_requests")
      .select("id, status, proposed_start, tutor_id")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("tutor_favorites")
      .select("tutor_id")
      .eq("student_id", studentId),
  ]);

  const tutorIds = [
    ...new Set([
      ...(sessions ?? []).map((s) => s.tutor_id),
      ...(requests ?? []).map((r) => r.tutor_id),
      ...(favs ?? []).map((f) => f.tutor_id),
    ]),
  ];

  const { data: tutors } =
    tutorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", tutorIds)
      : { data: [] as { id: string; full_name: string | null }[] };

  const tutorName = new Map(
    (tutors ?? []).map((t) => [t.id, t.full_name ?? "Tutor"] as const)
  );

  return NextResponse.json({
    sessions: (sessions ?? []).map((s) => ({
      ...s,
      tutorName: tutorName.get(s.tutor_id) ?? "Tutor",
    })),
    requests: (requests ?? []).map((r) => ({
      ...r,
      tutorName: tutorName.get(r.tutor_id) ?? "Tutor",
    })),
    favoriteTutors: (favs ?? []).map((f) => ({
      tutor_id: f.tutor_id,
      tutorName: tutorName.get(f.tutor_id) ?? "Tutor",
    })),
  });
}
