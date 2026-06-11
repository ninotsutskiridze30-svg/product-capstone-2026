import { fetchJson } from "@/shared/api/services/_shared";
import type { TutorListResponse } from "@/app/api/tutors/route";
import type { TutorDetailResponse } from "@/app/api/tutors/[slug]/route";
import type { TutorFilters } from "@/shared/lib/query-keys";

export type { TutorListResponse, TutorDetailResponse };
export type TutorListItem = TutorListResponse["tutors"][number];

export async function getTutors(filters: TutorFilters = {}): Promise<TutorListResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value == null) continue;
    params.set(key, String(value));
  }

  return fetchJson<TutorListResponse>(`/api/tutors?${params.toString()}`);
}

export async function getTutorBySlug(slug: string): Promise<TutorDetailResponse> {
  return fetchJson<TutorDetailResponse>(`/api/tutors/${slug}`);
}

export async function getFavoriteTutors(studentId: string) {
  return fetchJson<{ tutors: { id: string; full_name: string | null }[] }>(
    `/api/tutors?favoriteOf=${studentId}`
  );
}
