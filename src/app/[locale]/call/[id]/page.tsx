import { redirect } from "next/navigation";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { CallRoom } from "@/widgets/call-room/call-room";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function CallPage({ params }: PageProps) {
  const { id, locale } = await params;
  const authResult = await requireAuth();
  if ("response" in authResult) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createServerClient();
  const { data: call } = await supabase
    .from("call_sessions")
    .select("id,conversation_id,initiated_by,status,conversations!inner(tutor_id,student_id)")
    .eq("id", id)
    .maybeSingle();

  if (!call) {
    redirect(`/${locale}/dashboard`);
  }

  const conv = call.conversations as unknown as {
    tutor_id: string;
    student_id: string;
  };
  const userId = authResult.auth.userId;
  if (conv.tutor_id !== userId && conv.student_id !== userId) {
    redirect(`/${locale}/dashboard`);
  }

  // Tutors can open the whiteboard; both can save. Drive UI from the joiner's role.
  const role: "tutor" | "student" = conv.tutor_id === userId ? "tutor" : "student";

  return <CallRoom callId={call.id} role={role} />;
}
