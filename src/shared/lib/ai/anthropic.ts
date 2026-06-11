import Anthropic from "@anthropic-ai/sdk";

/** Construct an Anthropic client. Throws if the key is missing. */
export function createAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  return new Anthropic({ apiKey });
}

type UsageLike = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

// USD per 1M tokens.
const DEFAULT_PRICING = { input: 3, output: 15 };
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-opus-4-7": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

/** Rough cost estimate accounting for cache read/write discounts. */
export function estimateCostUsd(model: string, usage: UsageLike): number {
  const p = PRICING[model] ?? DEFAULT_PRICING;
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  const inputCost =
    ((input + cacheWrite * 1.25 + cacheRead * 0.1) / 1_000_000) * p.input;
  const outputCost = (output / 1_000_000) * p.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}
