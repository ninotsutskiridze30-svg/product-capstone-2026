import "server-only";

import { createServerClient } from "@/shared/api/supabase-server";

export async function getTutorDashboardOverview(tutorId: string) {
  const supabase = await createServerClient();

  const { count: pendingBookings } = await supabase
    .from("booking_requests")
    .select("id", { count: "exact", head: true })
    .eq("tutor_id", tutorId)
    .eq("status", "pending");

  const { count: upcomingSessions } = await supabase
    .from("lesson_sessions")
    .select("id", { count: "exact", head: true })
    .eq("tutor_id", tutorId)
    .in("status", ["pending", "confirmed"]);

  const { data: upcomingRows } = await supabase
    .from("lesson_sessions")
    .select("id, created_at, student_id, status")
    .eq("tutor_id", tutorId)
    .in("status", ["pending", "confirmed"])
    .order("created_at", { ascending: true })
    .limit(5);

  const upcomingStudentIds = [
    ...new Set((upcomingRows ?? []).map((r) => r.student_id)),
  ];
  const { data: upcomingProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", upcomingStudentIds);
  const nameByStudent = new Map(
    (upcomingProfiles ?? []).map((p) => [p.id, p.full_name] as const)
  );

  const upcomingList = (upcomingRows ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    studentName: nameByStudent.get(r.student_id) ?? "Student",
    status: r.status,
  }));

  const { data: studentRows } = await supabase
    .from("lesson_sessions")
    .select("student_id")
    .eq("tutor_id", tutorId);
  const totalStudentsApprox = new Set(
    (studentRows ?? []).map((r) => r.student_id)
  ).size;

  const { data: tutorProfile } = await supabase
    .from("tutor_profiles")
    .select("rating, review_count")
    .eq("id", tutorId)
    .maybeSingle();

  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .eq("tutor_id", tutorId);
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

  const { data: notifs } = await supabase
    .from("notifications")
    .select("id, title, body, created_at, is_read, type")
    .eq("user_id", tutorId)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: pendingRows } = await supabase
    .from("booking_requests")
    .select("id, student_id, message, proposed_start, proposed_end, type")
    .eq("tutor_id", tutorId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(8);

  const pendingStudentIds = [
    ...new Set((pendingRows ?? []).map((r) => r.student_id)),
  ];
  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", pendingStudentIds);
  const pendingNameByStudent = new Map(
    (pendingProfiles ?? []).map((p) => [p.id, p.full_name] as const)
  );

  const pendingList = (pendingRows ?? []).map((r) => ({
    id: r.id,
    studentName: pendingNameByStudent.get(r.student_id) ?? "Student",
    message: r.message,
    proposed_start: r.proposed_start,
    proposed_end: r.proposed_end,
    type: r.type,
  }));

  return {
    pendingBookings: pendingBookings ?? 0,
    upcomingSessions: upcomingSessions ?? 0,
    totalStudentsApprox,
    rating: tutorProfile?.rating ?? 0,
    reviewCount: tutorProfile?.review_count ?? 0,
    unreadMessages,
    monthlyEarnings: 0,
    upcomingList,
    pendingList,
    notifications: notifs ?? [],
  };
}
