import { Skeleton } from "@/shared/ui/skeleton";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
