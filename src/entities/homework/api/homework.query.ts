import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  homeworkApi,
  type HomeworkListFilters,
} from "./homework.api";
import type {
  CreateCommentInput,
  CreateHomeworkInput,
  GradeHomeworkInput,
  SubmitHomeworkInput,
  UpdateHomeworkInput,
} from "../model/homework.schema";

export const homeworkKeys = {
  all: ["homework"] as const,
  list: (filters?: HomeworkListFilters) =>
    [...homeworkKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...homeworkKeys.all, "detail", id] as const,
  recipients: () => [...homeworkKeys.all, "recipients"] as const,
  aiReview: (assignmentId: string, submissionId: string) =>
    [...homeworkKeys.all, "ai-review", assignmentId, submissionId] as const,
  comments: (assignmentId: string) =>
    [...homeworkKeys.all, "comments", assignmentId] as const,
};

export const homeworkListQueryOptions = (filters?: HomeworkListFilters) =>
  queryOptions({
    queryKey: homeworkKeys.list(filters),
    queryFn: () => homeworkApi.list(filters),
  });

export const homeworkDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: homeworkKeys.detail(id),
    queryFn: () => homeworkApi.detail(id),
    enabled: Boolean(id),
  });

export const homeworkRecipientsQueryOptions = () =>
  queryOptions({
    queryKey: homeworkKeys.recipients(),
    queryFn: () => homeworkApi.recipients(),
  });

export const useHomeworkList = (filters?: HomeworkListFilters) =>
  useQuery(homeworkListQueryOptions(filters));

export const useHomeworkDetail = (id: string) =>
  useQuery(homeworkDetailQueryOptions(id));

export const useHomeworkRecipients = () =>
  useQuery(homeworkRecipientsQueryOptions());

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHomeworkInput) => homeworkApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeworkKeys.all });
    },
  });
}

export function useUpdateHomework(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateHomeworkInput) =>
      homeworkApi.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeworkKeys.all });
    },
  });
}

export function useDeleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => homeworkApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeworkKeys.all });
    },
  });
}

export function useSubmitHomework(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitHomeworkInput) =>
      homeworkApi.submit(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeworkKeys.all });
    },
  });
}

export function useGradeHomework(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GradeHomeworkInput) =>
      homeworkApi.grade(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeworkKeys.all });
    },
  });
}

// ---------- AI review (tutor-only) ----------

export const homeworkAiReviewQueryOptions = (
  assignmentId: string,
  submissionId: string
) =>
  queryOptions({
    queryKey: homeworkKeys.aiReview(assignmentId, submissionId),
    queryFn: () => homeworkApi.aiReview(assignmentId, submissionId),
    enabled: Boolean(assignmentId && submissionId),
    // Poll while the latest run is still being produced.
    refetchInterval: (query) => {
      const latest = query.state.data?.items?.[0];
      return latest && (latest.status === "pending" || latest.status === "running")
        ? 4000
        : false;
    },
  });

export const useHomeworkAiReview = (
  assignmentId: string,
  submissionId: string
) => useQuery(homeworkAiReviewQueryOptions(assignmentId, submissionId));

export function useReanalyzeHomework(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) =>
      homeworkApi.reanalyze(assignmentId, submissionId),
    onSuccess: (_data, submissionId) => {
      void qc.invalidateQueries({
        queryKey: homeworkKeys.aiReview(assignmentId, submissionId),
      });
    },
  });
}

// ---------- Comments (party-visible) ----------

export const useHomeworkComments = (assignmentId: string) =>
  useQuery({
    queryKey: homeworkKeys.comments(assignmentId),
    queryFn: () => homeworkApi.comments(assignmentId),
    enabled: Boolean(assignmentId),
  });

export function useAddHomeworkComment(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentInput) =>
      homeworkApi.addComment(assignmentId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: homeworkKeys.comments(assignmentId),
      });
      void qc.invalidateQueries({
        queryKey: homeworkKeys.detail(assignmentId),
      });
    },
  });
}
