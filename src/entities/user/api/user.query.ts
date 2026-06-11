import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { userApi } from "./user.api";

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  tutorCompleteData: () => [...userKeys.all, "tutor-complete-data"] as const,
  studentCompleteData: () => [...userKeys.all, "student-complete-data"] as const,
};

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: () => userApi.getMe(),
    staleTime: 0,
    refetchOnMount: "always",
  });

export const tutorCompleteDataQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.tutorCompleteData(),
    queryFn: () => userApi.getTutorCompleteData(),
    staleTime: 0,
  });

export const studentCompleteDataQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.studentCompleteData(),
    queryFn: () => userApi.getStudentCompleteData(),
    staleTime: 0,
  });

export const useCurrentUser = () => useQuery(currentUserQueryOptions());
export const useTutorCompleteData = () => useQuery(tutorCompleteDataQueryOptions());
export const useStudentCompleteData = () => useQuery(studentCompleteDataQueryOptions());

export function useAuthUserId(): string | null {
  const { data } = useCurrentUser();
  return data?.user?.id ?? null;
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.signInWithPassword,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.signUp,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

/** Returns OAuth authorize URL; session is established after redirect via /auth/callback. */
export function useRequestOAuthUrl() {
  return useMutation({
    mutationFn: userApi.requestOAuthUrl,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.signOut,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updatePassword,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
