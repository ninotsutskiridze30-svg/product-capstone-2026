import { Skeleton } from "@/shared/ui/skeleton";

export default function TutorGroupsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-44" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}
