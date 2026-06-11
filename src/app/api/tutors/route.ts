import { NextResponse } from "next/server";

import {
  getFieldLabelsForTutors,
  listPublicTutors,
} from "@/entities/tutor/queries";
import { tutorFiltersSchema } from "@/shared/lib/schemas";

export const revalidate = 60;

export type TutorListResponse = {
  tutors: (Awaited<ReturnType<typeof listPublicTutors>>["tutors"][number] & {
    fieldLabels: string[];
  })[];
  total: number;
  page: number;
  limit: number;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<TutorListResponse | ApiErrorResponse>> {
  try {
    const url = new URL(request.url);
    const parsed = tutorFiltersSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid query params" },
        { status: 400 }
      );
    }

    const filters = parsed.data;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const offset = (page - 1) * limit;

    const queryParams: {
      search?: string;
      fieldId?: string;
      city?: string;
      priceMin?: number;
      priceMax?: number;
      minRating?: number;
      language?: string;
      availableOn?: string;
      offset: number;
      limit: number;
    } = { offset, limit };
    if (filters.q) queryParams.search = filters.q;
    if (filters.field) queryParams.fieldId = filters.field;
    if (filters.city) queryParams.city = filters.city;
    if (filters.priceMin != null) queryParams.priceMin = filters.priceMin;
    if (filters.priceMax != null) queryParams.priceMax = filters.priceMax;
    if (filters.rating != null) queryParams.minRating = filters.rating;
    if (filters.language) queryParams.language = filters.language;
    if (filters.date) queryParams.availableOn = filters.date;

    const { tutors, totalApprox } = await listPublicTutors(queryParams);

    const labelMap = await getFieldLabelsForTutors(tutors.map((item) => item.id));

    return NextResponse.json({
      tutors: tutors.map((item) => ({
        ...item,
        fieldLabels: labelMap.get(item.id) ?? [],
      })),
      total: totalApprox,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load tutors" }, { status: 500 });
  }
}
