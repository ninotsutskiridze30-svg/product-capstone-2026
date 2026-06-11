import { fetchJson } from "@/shared/api/services/_shared";
import type { ReviewCreateInput } from "@/shared/lib/schemas/review.schema";

export async function createReview(input: ReviewCreateInput) {
  return fetchJson<{ success: true }>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
