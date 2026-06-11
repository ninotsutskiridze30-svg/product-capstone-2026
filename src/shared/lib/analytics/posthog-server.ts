import { PostHog } from "posthog-node";

/**
 * Server-side PostHog client (posthog-node).
 *
 * Creates a fresh client per call — correct for short-lived Next.js
 * serverless / edge functions. Always call `await client.shutdown()`
 * after sending events to flush the queue immediately.
 */
export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) return null;
  return new PostHog(key, { ...(host ? { host } : {}), flushAt: 1, flushInterval: 0 });
}
