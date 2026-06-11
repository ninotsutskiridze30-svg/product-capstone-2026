import { useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteApi } from "./favorite.api";

export const favoriteKeys = {
  all: ["favorites"] as const,
};

export function useToggleTutorFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tutorId: string) => favoriteApi.toggleTutorFavorite(tutorId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
