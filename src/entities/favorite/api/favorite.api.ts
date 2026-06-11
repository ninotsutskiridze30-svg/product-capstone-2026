import type { FavoriteToggleResponse } from "@/app/api/student/favorites/route";
import { fetchJson } from "@/shared/api/services/_shared";

export const favoriteApi = {
  toggleTutorFavorite: async (tutorId: string) => {
    return fetchJson<FavoriteToggleResponse>("/api/student/favorites", {
      method: "POST",
      body: JSON.stringify({ tutorId }),
    });
  },
};
