"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { PropsWithChildren } from "react";

import { getPostHog } from "@/shared/lib/analytics/posthog-client";

/**
 * Wraps the app and emits a manual pageview to PostHog on every App Router
 * navigation. No-op when NEXT_PUBLIC_POSTHOG_KEY is unset.
 *
 * Wired in src/app/layout.tsx.
 */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    void (async () => {
      const ph = await getPostHog();
      if (!ph) return;
      const query = searchParams?.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      ph.capture("$pageview", { $current_url: url });
    })();
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: PropsWithChildren) {
  // Bootstrap PostHog on first client mount (idempotent).
  useEffect(() => {
    void getPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
