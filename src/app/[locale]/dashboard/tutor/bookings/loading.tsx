import { Skeleton } from "@/shared/ui/skeleton";

export default function TutorBookingsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-8 w-72" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
