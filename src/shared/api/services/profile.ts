import { fetchJson } from "@/shared/api/services/_shared";
import type { ProfilePatchInput } from "@/shared/lib/schemas/profile.schema";
import type { Profile, TutorProfile } from "@/shared/types/database.types";

export type CurrentProfileResponse = {
  profile: Profile | null;
  tutorProfile: TutorProfile | null;
};

export async function getCurrentProfile(): Promise<CurrentProfileResponse> {
  return fetchJson<CurrentProfileResponse>("/api/profile");
}

export async function updateProfile(input: ProfilePatchInput) {
  return fetchJson<{ success: true }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
