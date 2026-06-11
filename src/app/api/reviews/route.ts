import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { reviewCreateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type ReviewMutationResponse = {
  success: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function POST(
  request: Request
): Promise<NextResponse<ReviewMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("student");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = reviewCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from("lesson_sessions")
      .select("id,tutor_id,student_id,status")
      .eq("id", parsed.data.sessionId)
      .maybeSingle();

    if (!session || session.student_id !== authResult.auth.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("session_id", parsed.data.sessionId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    const { error } = await supabase.from("reviews").insert({
      tutor_id: parsed.data.tutorId,
      student_id: authResult.auth.userId,
      session_id: parsed.data.sessionId,
      rating: parsed.data.rating,
      content: parsed.data.content ?? null,
      is_visible: true,
    });
    if (error) {
      throw error;
    }

    const { data: aggregate } = await supabase
      .from("reviews")
      .select("rating")
      .eq("tutor_id", parsed.data.tutorId)
      .eq("is_visible", true);

    const ratings = (aggregate ?? []).map((review) => review.rating);
    const reviewCount = ratings.length;
    const avgRating =
      reviewCount === 0
        ? 0
        : ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount;

    await supabase
      .from("tutor_profiles")
      .update({
        rating: Number(avgRating.toFixed(2)),
        review_count: reviewCount,
      })
      .eq("id", parsed.data.tutorId);

    await supabase.from("notifications").insert({
      user_id: parsed.data.tutorId,
      type: "review",
      title: "New review",
      body: "A student left a review for your session.",
      payload: { sessionId: parsed.data.sessionId, rating: parsed.data.rating },
      actor_id: authResult.auth.userId,
      is_read: false,
    });

    revalidateTag(`tutor-${parsed.data.tutorSlug}`, "max");
    revalidateTag("tutors-list", "max");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
