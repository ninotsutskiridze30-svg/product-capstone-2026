import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  ...(process.env.NEXT_PUBLIC_POSTHOG_HOST ? { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST } : {}),
  defaults: "2026-01-30",
  capture_pageview: false, // manual pageview via PostHogProvider
  capture_pageleave: true,
  person_profiles: "identified_only",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
