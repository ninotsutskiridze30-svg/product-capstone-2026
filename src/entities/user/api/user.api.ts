import { fetchJson } from "@/shared/api/services/_shared";
import type { User } from "../model/user.schema";
import type { FieldCategoryWithFields } from "@/features/auth/tutor-register-data";

export type CurrentUserResponse = {
  user: User | null;
};

export type TutorCompleteDataResponse =
  | { status: "complete" }
  | { status: "pending"; defaultFullName: string; categories: FieldCategoryWithFields[] };

export type StudentCompleteDataResponse =
  | { status: "wrong_role" }
  | {
      status: "pending";
      defaultValues: {
        fullName: string;
        phone: string;
        city: string;
        country: string;
        bio: string;
      };
    };

export type SignInInput = { email: string; password: string };
export type SignInResponse = { ok: true };

export type SignUpInput = {
  email: string;
  password: string;
  emailRedirectTo: string;
};
export type SignUpResponse = { userId: string | null; session: boolean };

export type OAuthUrlInput = { provider: "google"; redirectTo: string };
export type OAuthUrlResponse = { url: string };

export type SignOutResponse = { ok: true };

export type UpdatePasswordInput = { password: string };
export type UpdatePasswordResponse = { ok: true };

export const userApi = {
  getMe: async (): Promise<CurrentUserResponse> => {
    return fetchJson<CurrentUserResponse>("/api/auth/me");
  },
  getTutorCompleteData: async (): Promise<TutorCompleteDataResponse> => {
    return fetchJson<TutorCompleteDataResponse>("/api/auth/tutor-complete-data");
  },
  getStudentCompleteData: async (): Promise<StudentCompleteDataResponse> => {
    return fetchJson<StudentCompleteDataResponse>("/api/auth/student-complete-data");
  },
  signInWithPassword: async (input: SignInInput): Promise<SignInResponse> => {
    return fetchJson<SignInResponse>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  signUp: async (input: SignUpInput): Promise<SignUpResponse> => {
    return fetchJson<SignUpResponse>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  requestOAuthUrl: async (input: OAuthUrlInput): Promise<OAuthUrlResponse> => {
    return fetchJson<OAuthUrlResponse>("/api/auth/oauth", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  signOut: async (): Promise<SignOutResponse> => {
    return fetchJson<SignOutResponse>("/api/auth/sign-out", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  updatePassword: async (input: UpdatePasswordInput): Promise<UpdatePasswordResponse> => {
    return fetchJson<UpdatePasswordResponse>("/api/auth/password", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
