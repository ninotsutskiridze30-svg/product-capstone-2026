import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ProfilePatchInput, TutorNotificationPrefsPatchInput } from "@/shared/lib/schemas";
import {
  tutorApi,
  type TutorGroupsData,
  type TutorProfileData,
  type TutorSettingsData,
} from "./tutor.api";

export type { TutorProfileData, TutorSettingsData, TutorGroupsData };

export const tutorProfileQueryOptions = () =>
  queryOptions({
    queryKey: ["tutor", "profile"],
    queryFn: () => tutorApi.getProfile(),
  });

export const tutorSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["tutor", "settings"],
    queryFn: () => tutorApi.getSettings(),
  });

export const tutorGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["tutor", "groups"],
    queryFn: () => tutorApi.getGroups(),
  });

export const useTutorProfile = () => useQuery(tutorProfileQueryOptions());
export const useTutorSettings = () => useQuery(tutorSettingsQueryOptions());
export const useTutorGroups = () => useQuery(tutorGroupsQueryOptions());

export function useUpdateTutorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfilePatchInput) => tutorApi.patchProfile(body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor", "profile"] });
    },
  });
}

export function useUpdateTutorNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TutorNotificationPrefsPatchInput) =>
      tutorApi.patchNotificationPreferences(body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor", "settings"] });
    },
  });
}
