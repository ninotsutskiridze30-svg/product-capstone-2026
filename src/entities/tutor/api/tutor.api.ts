import type { TutorListResponse } from "@/app/api/tutors/route";
import { fetchJson } from "@/shared/api/services/_shared";
import type { TutorFilters } from "@/shared/lib/query-keys";
import type {
  ProfilePatchInput,
  TutorNotificationPrefsPatchInput,
} from "@/shared/lib/schemas";
import type { TutorDashboardOverview } from "../model/tutor.schema";

export type TutorProfileData = {
  profile: {
    full_name: string | null;
    bio: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  } | null;
  tutor: {
    headline: string | null;
    hourly_rate_min: number | null;
    hourly_rate_max: number | null;
    experience_years: number | null;
    languages: string[] | null;
    website_url: string | null;
    linkedin_url: string | null;
    education: unknown;
    certifications: unknown;
  } | null;
  publicUrl: string;
  userId: string;
};

export type TutorSettingsData = {
  prefs: {
    email_booking: boolean;
    email_message: boolean;
    push_booking: boolean;
    push_message: boolean;
  };
};

export type TutorGroupsData = {
  tutorId: string;
  groups: Array<{
    id: string;
    name: string;
    max_students: number;
    current_count: number;
    description: string | null;
    is_active: boolean;
    field_id: string;
    fieldName: string;
  }>;
  fields: Array<{ id: string; name: string }>;
};

export const tutorApi = {
  getList: async (filters: TutorFilters = {}): Promise<TutorListResponse> => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value == null) continue;
      params.set(key, String(value));
    }
    return fetchJson<TutorListResponse>(`/api/tutors?${params.toString()}`);
  },

  getById: async (slug: string) => {
    return fetchJson<{ detail: unknown }>(`/api/tutors/${slug}`);
  },

  getDashboard: async (): Promise<TutorDashboardOverview> => {
    return fetchJson<TutorDashboardOverview>("/api/tutor/dashboard");
  },

  getProfile: async (): Promise<TutorProfileData> => {
    return fetchJson<TutorProfileData>("/api/tutor/profile");
  },

  getSettings: async (): Promise<TutorSettingsData> => {
    return fetchJson<TutorSettingsData>("/api/tutor/settings");
  },

  getGroups: async (): Promise<TutorGroupsData> => {
    return fetchJson<TutorGroupsData>("/api/tutor/groups");
  },

  patchProfile: async (body: ProfilePatchInput) => {
    return fetchJson<{ success: true }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  patchNotificationPreferences: async (body: TutorNotificationPrefsPatchInput) => {
    return fetchJson<{ success: true }>("/api/tutor/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};
