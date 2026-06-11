import type { ReviewCreateInput } from "@/shared/lib/schemas";
import { fetchJson } from "@/shared/api/services/_shared";

export const reviewApi = {
  submitReview: async (input: ReviewCreateInput) => {
    return fetchJson<{ success: true }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
