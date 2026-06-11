import { fetchJson } from "@/shared/api/services/_shared";
import type {
  CreateCommentInput,
  CreateHomeworkInput,
  GradeHomeworkInput,
  HomeworkAiReview,
  HomeworkAssignment,
  HomeworkAssignmentDetail,
  HomeworkComment,
  HomeworkStatus,
  SubmitHomeworkInput,
  UpdateHomeworkInput,
} from "../model/homework.schema";

export type HomeworkListFilters = {
  status?: HomeworkStatus | "all";
  studentId?: string;
  tutorId?: string;
  batchId?: string;
};

function toQuery(filters?: HomeworkListFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.studentId) params.set("studentId", filters.studentId);
  if (filters.tutorId) params.set("tutorId", filters.tutorId);
  if (filters.batchId) params.set("batchId", filters.batchId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export type HomeworkRecipientOption = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type HomeworkGroupOption = {
  id: string;
  name: string;
  memberCount: number;
};

export type HomeworkRecipientsResponse = {
  students: HomeworkRecipientOption[];
  groups: HomeworkGroupOption[];
};

export type HomeworkFileSignResponse = { url: string };

export type HomeworkCreatedResponse = {
  batch_id: string | null;
  created: HomeworkAssignment[];
};

export const homeworkApi = {
  list: async (filters?: HomeworkListFilters) => {
    return fetchJson<{ items: HomeworkAssignment[] }>(
      `/api/homework${toQuery(filters)}`
    );
  },
  detail: async (id: string) => {
    return fetchJson<HomeworkAssignmentDetail>(`/api/homework/${id}`);
  },
  create: async (payload: CreateHomeworkInput) => {
    return fetchJson<HomeworkCreatedResponse>("/api/homework", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: UpdateHomeworkInput) => {
    return fetchJson<HomeworkAssignment>(`/api/homework/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return fetchJson<{ id: string; deleted: true }>(`/api/homework/${id}`, {
      method: "DELETE",
    });
  },
  submit: async (id: string, payload: SubmitHomeworkInput) => {
    return fetchJson<{ id: string }>(`/api/homework/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  grade: async (id: string, payload: GradeHomeworkInput) => {
    return fetchJson<{ id: string }>(`/api/homework/${id}/grade`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  recipients: async () => {
    return fetchJson<HomeworkRecipientsResponse>("/api/homework/recipients");
  },
  signFile: async (path: string) => {
    return fetchJson<HomeworkFileSignResponse>(
      `/api/homework/file?path=${encodeURIComponent(path)}`
    );
  },
  aiReview: async (assignmentId: string, submissionId: string) => {
    return fetchJson<{ items: HomeworkAiReview[] }>(
      `/api/homework/${assignmentId}/ai-review?submissionId=${encodeURIComponent(
        submissionId
      )}`
    );
  },
  reanalyze: async (assignmentId: string, submissionId: string) => {
    return fetchJson<{ status: string }>(
      `/api/homework/${assignmentId}/ai-review`,
      {
        method: "POST",
        body: JSON.stringify({ submissionId }),
      }
    );
  },
  comments: async (assignmentId: string) => {
    return fetchJson<{ items: HomeworkComment[] }>(
      `/api/homework/${assignmentId}/comments`
    );
  },
  addComment: async (assignmentId: string, payload: CreateCommentInput) => {
    return fetchJson<HomeworkComment>(
      `/api/homework/${assignmentId}/comments`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
