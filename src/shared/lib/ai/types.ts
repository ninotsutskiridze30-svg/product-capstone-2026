import type { HomeworkAiReviewResult } from "@/entities/homework/model/homework.schema";

/** Provider-neutral representation of a student's attachment. */
export type AiAttachment =
  | { kind: "pdf"; mediaType: string; base64: string }
  | { kind: "image"; mediaType: string; base64: string }
  | { kind: "text"; text: string };

export type AiUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  costUsd: number | null;
};

export type GenerateReviewArgs = {
  system: string;
  prompt: string;
  attachment: AiAttachment | null;
};

export type GenerateReviewResult = {
  result: HomeworkAiReviewResult;
  usage: AiUsage;
  model: string;
};
