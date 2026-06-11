import { Skeleton } from "@/shared/ui/skeleton";

export const dynamic = "force-dynamic";

// Middleware (proxy.ts) redirects /dashboard to /dashboard/tutor or /dashboard/student
// based on the user's role. This page is a fallback shown briefly during the redirect.
export default function DashboardIndexPage() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="h-8 w-48" />
    </div>
  );
}
