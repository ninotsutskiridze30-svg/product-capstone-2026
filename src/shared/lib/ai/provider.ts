import "server-only";

import { generateAnthropicReview } from "./providers/anthropic-provider";
import { generateGeminiReview } from "./providers/gemini-provider";
import type { GenerateReviewArgs, GenerateReviewResult } from "./types";

export type AiProviderName = "anthropic" | "gemini";

/**
 * Active AI provider. Defaults to "anthropic" (production-safe — does not train
 * on your data). Set AI_PROVIDER=gemini for free local development.
 */
export function activeProvider(): AiProviderName {
  return (process.env.AI_PROVIDER ?? "anthropic").toLowerCase() === "gemini"
    ? "gemini"
    : "anthropic";
}

export function activeModel(): string {
  return activeProvider() === "gemini"
    ? process.env.GEMINI_HOMEWORK_MODEL ?? "gemini-2.5-flash"
    : process.env.ANTHROPIC_HOMEWORK_MODEL ?? "claude-sonnet-4-6";
}

/** Global kill switch for homework AI review. */
export function isHomeworkAiEnabled(): boolean {
  return process.env.HOMEWORK_AI_ENABLED !== "false";
}

/** Dispatch a homework review to the active provider. */
export function generateReview(
  args: GenerateReviewArgs
): Promise<GenerateReviewResult> {
  const model = activeModel();
  return activeProvider() === "gemini"
    ? generateGeminiReview(args, model)
    : generateAnthropicReview(args, model);
}
