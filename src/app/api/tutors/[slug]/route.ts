import { NextResponse } from "next/server";
import { z } from "zod";

import { getTutorPublicDetail } from "@/entities/tutor/queries";

export const revalidate = 300;

const paramsSchema = z.object({
  slug: z.string().uuid(),
});

export type TutorDetailResponse = {
  detail: NonNullable<Awaited<ReturnType<typeof getTutorPublicDetail>>>;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<TutorDetailResponse | ApiErrorResponse>> {
  let tutorSlug: string | null = null;
  try {
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tutor slug" },
        { status: 400 }
      );
    }
    tutorSlug = parsed.data.slug;

    const detail = await getTutorPublicDetail(tutorSlug);
    if (!detail) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json({ detail });
  } catch (error) {
    console.error("GET /api/tutors/[slug] failed", {
      tutorSlug,
      error,
    });
    return NextResponse.json(
      { error: "Failed to load tutor profile" },
      { status: 500 }
    );
  }
}
