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
    { count: pendingBookings },
    { count: upcomingSessions },
    { data: upcomingRows },
    { data: studentRows },
    { data: tutorProfile },
    { data: convs },
    { data: notifs },
    { data: pendingRows },
  ] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("tutor_id", tutorId)
      .eq("status", "pending"),
    supabase
      .from("lesson_sessions")
      .select("id", { count: "exact", head: true })
      .eq("tutor_id", tutorId)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("lesson_sessions")
      .select("id, created_at, student_id, status")
      .eq("tutor_id", tutorId)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: true })
      .limit(5),
    supabase
      .from("lesson_sessions")
      .select("student_id")
      .eq("tutor_id", tutorId),
    supabase
      .from("tutor_profiles")
      .select("rating, review_count")
      .eq("id", tutorId)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select("id")
      .eq("tutor_id", tutorId),
    supabase
      .from("notifications")
      .select("id, title, body, created_at, is_read, type")
      .eq("user_id", tutorId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("booking_requests")
      .select("id, student_id, message, proposed_start, proposed_end, type")
      .eq("tutor_id", tutorId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const upcomingStudentIds = [...new Set((upcomingRows ?? []).map((r) => r.student_id))];
  const pendingStudentIds = [...new Set((pendingRows ?? []).map((r) => r.student_id))];
  const allStudentIds = [...new Set([...upcomingStudentIds, ...pendingStudentIds])];

  const { data: profiles } =
    allStudentIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", allStudentIds)
      : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Student"] as const)
  );

  const convIds = (convs ?? []).map((c) => c.id);
  let unreadMessages = 0;
  if (convIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", tutorId);
    unreadMessages = count ?? 0;
  }

  return NextResponse.json({
    pendingBookings: pendingBookings ?? 0,
    upcomingSessions: upcomingSessions ?? 0,
    totalStudentsApprox: new Set((studentRows ?? []).map((r) => r.student_id)).size,
    rating: tutorProfile?.rating ?? 0,
    reviewCount: tutorProfile?.review_count ?? 0,
    unreadMessages,
    monthlyEarnings: 0,
    upcomingList: (upcomingRows ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      studentName: nameById.get(r.student_id) ?? "Student",
      status: r.status,
    })),
    pendingList: (pendingRows ?? []).map((r) => ({
      id: r.id,
      studentName: nameById.get(r.student_id) ?? "Student",
      message: r.message,
      proposed_start: r.proposed_start,
      proposed_end: r.proposed_end,
      type: r.type,
    })),
    notifications: notifs ?? [],
  });
}
