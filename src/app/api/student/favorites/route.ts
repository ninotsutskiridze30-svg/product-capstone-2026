import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  tutorId: z.string().uuid(),
});

export type FavoriteToggleResponse = {
  ok: true;
  favorited: boolean;
};

type ApiErrorResponse = {
  error: string;
};

export async function POST(
  request: Request
): Promise<NextResponse<FavoriteToggleResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("student");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const studentId = authResult.auth.userId;
    const { tutorId } = parsed.data;

    const { data: existing } = await supabase
      .from("tutor_favorites")
      .select("id")
      .eq("student_id", studentId)
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("tutor_favorites")
        .delete()
        .eq("id", existing.id);
      if (error) {
        throw error;
      }
      revalidatePath("/dashboard/student");
      revalidatePath(`/tutors/${tutorId}`);
      return NextResponse.json({ ok: true, favorited: false });
    }

    const { error } = await supabase.from("tutor_favorites").insert({
      student_id: studentId,
      tutor_id: tutorId,
    });
    if (error) {
      throw error;
    }

    revalidatePath("/dashboard/student");
    revalidatePath(`/tutors/${tutorId}`);
    return NextResponse.json({ ok: true, favorited: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}
