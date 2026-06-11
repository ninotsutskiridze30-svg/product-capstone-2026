import "server-only";

import type Anthropic from "@anthropic-ai/sdk";

import { HomeworkAiReviewResultSchema } from "@/entities/homework/model/homework.schema";
import { createAnthropic, estimateCostUsd } from "../anthropic";
import type {
  AiAttachment,
  GenerateReviewArgs,
  GenerateReviewResult,
} from "../types";

// Standard JSON Schema (Anthropic structured outputs). No numeric min/max —
// those are clamped in code after parsing.
const REVIEW_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    originality: {
      type: "object",
      additionalProperties: false,
      properties: {
        likelihood_ai_generated: { type: "string", enum: ["low", "medium", "high"] },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        reasoning: { type: "string" },
        signals: { type: "array", items: { type: "string" } },
      },
      required: ["likelihood_ai_generated", "confidence", "reasoning", "signals"],
    },
    suggested_score: { type: ["number", "null"] },
    per_criterion: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          criterion_id: { type: ["string", "null"] },
          label: { type: "string" },
          points_awarded: { type: "number" },
          max_points: { type: "number" },
          justification: { type: "string" },
        },
        required: ["criterion_id", "label", "points_awarded", "max_points", "justification"],
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    issues: { type: "array", items: { type: "string" } },
    draft_feedback: { type: "string" },
    summary: { type: "string" },
  },
  required: [
    "originality",
    "suggested_score",
    "per_criterion",
    "strengths",
    "issues",
    "draft_feedback",
    "summary",
  ],
} as const;

function toContentBlock(att: AiAttachment): Anthropic.ContentBlockParam {
  if (att.kind === "text") return { type: "text", text: att.text };
  if (att.kind === "pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: att.base64 },
    };
  }
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: att.mediaType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
      data: att.base64,
    },
  };
}

export async function generateAnthropicReview(
  args: GenerateReviewArgs,
  model: string
): Promise<GenerateReviewResult> {
  const client = createAnthropic();

  const content: Anthropic.ContentBlockParam[] = [
    { type: "text", text: args.prompt },
  ];
  if (args.attachment) content.push(toContentBlock(args.attachment));

  const response = await client.messages.create({
    model,
    max_tokens: 12000,
    thinking: { type: "adaptive" },
    system: [
      { type: "text", text: args.system, cache_control: { type: "ephemeral" } },
    ],
    output_config: { format: { type: "json_schema", schema: REVIEW_JSON_SCHEMA } },
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) throw new Error("Model returned no structured output");
  const result = HomeworkAiReviewResultSchema.parse(JSON.parse(textBlock.text));

  return {
    result,
    model,
    usage: {
      inputTokens: response.usage.input_tokens ?? null,
      outputTokens: response.usage.output_tokens ?? null,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? null,
      cacheWriteTokens: response.usage.cache_creation_input_tokens ?? null,
      costUsd: estimateCostUsd(model, response.usage),
    },
  };
}
