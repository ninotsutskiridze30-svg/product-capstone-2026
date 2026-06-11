import { Skeleton } from "@/shared/ui/skeleton";

interface Props {
  cards?: number;
}

export function TutorsListSkeleton({ cards = 8 }: Props) {
  return (
    <main className="max-w-7xl mx-auto py-12 md:py-20">
      <div className="space-y-6">
        <aside className="bg-surface border-border space-y-6 rounded-xl border p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-12 w-72 md:h-14 md:w-96" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {Array.from({ length: cards }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface space-y-4 rounded-xl border border-border p-4 md:p-6"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
