import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReviewCreateInput } from "@/shared/lib/schemas";
import { reviewApi } from "./review.api";

export const reviewKeys = {
  all: ["reviews"] as const,
};

export function useSubmitSessionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewCreateInput) => reviewApi.submitReview(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
