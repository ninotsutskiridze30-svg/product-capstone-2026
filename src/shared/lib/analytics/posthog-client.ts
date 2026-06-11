/**
 * Browser PostHog client accessor.
 *
 * PostHog is initialized via instrumentation-client.ts (Next.js 15.3+).
 * This module simply returns the already-initialized singleton so callers
 * remain async-compatible without re-initializing.
 */

import posthog from "posthog-js";

export async function getPostHog() {
  if (typeof window === "undefined") return null;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  return posthog;
}
