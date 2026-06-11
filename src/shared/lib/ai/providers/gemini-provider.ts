import "server-only";

import { GoogleGenAI, Type, type Part, type Schema } from "@google/genai";

import { HomeworkAiReviewResultSchema } from "@/entities/homework/model/homework.schema";
import type {
  AiAttachment,
  GenerateReviewArgs,
  GenerateReviewResult,
} from "../types";

// Gemini structured-output schema (OpenAPI subset). Mirrors the Anthropic schema;
// nullable fields use `nullable: true` instead of a ["x","null"] union.
const GEMINI_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    originality: {
      type: Type.OBJECT,
      properties: {
        likelihood_ai_generated: { type: Type.STRING, enum: ["low", "medium", "high"] },
        confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
        reasoning: { type: Type.STRING },
        signals: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["likelihood_ai_generated", "confidence", "reasoning", "signals"],
    },
    suggested_score: { type: Type.NUMBER, nullable: true },
    per_criterion: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion_id: { type: Type.STRING, nullable: true },
          label: { type: Type.STRING },
          points_awarded: { type: Type.NUMBER },
          max_points: { type: Type.NUMBER },
          justification: { type: Type.STRING },
        },
        required: ["label", "points_awarded", "max_points", "justification"],
      },
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    issues: { type: Type.ARRAY, items: { type: Type.STRING } },
    draft_feedback: { type: Type.STRING },
    summary: { type: Type.STRING },
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
};

// USD per 1M tokens (paid tier; on the free tier actual cost is $0 but this still
// gives the tutor a useful "what this would cost" figure).
const GEMINI_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
  "gemini-2.5-pro": { input: 1.25, output: 10 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
};

function toParts(prompt: string, att: AiAttachment | null): Part[] {
  const parts: Part[] = [{ text: prompt }];
  if (att) {
    if (att.kind === "text") parts.push({ text: att.text });
    else parts.push({ inlineData: { mimeType: att.mediaType, data: att.base64 } });
  }
  return parts;
}

export async function generateGeminiReview(
  args: GenerateReviewArgs,
  model: string
): Promise<GenerateReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: toParts(args.prompt, args.attachment) }],
    config: {
      systemInstruction: args.system,
      responseMimeType: "application/json",
      responseSchema: GEMINI_SCHEMA,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Gemini returned no output");
  const result = HomeworkAiReviewResultSchema.parse(JSON.parse(raw));

  const usage = response.usageMetadata;
  const input = usage?.promptTokenCount ?? 0;
  const output = usage?.candidatesTokenCount ?? 0;
  const price = GEMINI_PRICING[model];
  const costUsd = price
    ? Math.round(((input / 1e6) * price.input + (output / 1e6) * price.output) * 10000) / 10000
    : null;

  return {
    result,
    model,
    usage: {
      inputTokens: input || null,
      outputTokens: output || null,
      cacheReadTokens: usage?.cachedContentTokenCount ?? null,
      cacheWriteTokens: null,
      costUsd,
    },
  };
}
