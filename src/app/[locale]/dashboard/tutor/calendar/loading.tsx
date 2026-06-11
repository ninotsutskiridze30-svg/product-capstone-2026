import { Skeleton } from "@/shared/ui/skeleton";

export default function TutorCalendarLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
