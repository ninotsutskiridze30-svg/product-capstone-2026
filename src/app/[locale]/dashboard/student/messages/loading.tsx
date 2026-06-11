import { Skeleton } from "@/shared/ui/skeleton";

export default function StudentMessagesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-[560px] w-full" />
    </div>
  );
}
