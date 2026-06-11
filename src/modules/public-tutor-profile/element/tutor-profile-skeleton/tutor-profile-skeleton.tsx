import { Skeleton } from "@/shared/ui/skeleton";

const SUBJECT_ROW_COUNT = 4;
const REVIEW_ROW_COUNT = 3;
const GALLERY_ITEM_COUNT = 3;

export function TutorProfileSkeleton() {
  return (
    <main className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 py-12 md:py-20">
      <div className="bg-surface relative overflow-hidden rounded-2xl border border-border shadow-card">
        <Skeleton className="aspect-[21/8] w-full" />
        <div className="bg-surface/95 supports-backdrop-filter:bg-surface/80 absolute bottom-0 left-0 flex w-full items-end gap-4 border-t border-border p-4 md:p-6 backdrop-blur">
          <Skeleton className="h-[120px] w-[120px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-10 w-64 max-w-full" />
            <Skeleton className="h-5 w-80 max-w-full" />
            <Skeleton className="h-4 w-52 max-w-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="space-y-3">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-4 w-full max-w-[65ch]" />
            <Skeleton className="h-4 w-full max-w-[62ch]" />
            <Skeleton className="h-4 w-4/5 max-w-[58ch]" />
          </section>

          <section className="space-y-3">
            <Skeleton className="h-9 w-44" />
            <ul className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: SUBJECT_ROW_COUNT }).map((_, idx) => (
                <li
                  key={idx}
                  className="bg-surface space-y-2 rounded-lg border border-border px-3 py-2"
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3.5 w-20" />
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <Skeleton className="h-9 w-56" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full max-w-[60ch]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full max-w-[60ch]" />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <Skeleton className="h-9 w-36" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </div>
          </section>

          <section className="space-y-3">
            <Skeleton className="h-9 w-28" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: GALLERY_ITEM_COUNT }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-video w-full rounded-lg" />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
            <ul className="space-y-3">
              {Array.from({ length: REVIEW_ROW_COUNT }).map((_, idx) => (
                <li
                  key={idx}
                  className="bg-surface space-y-3 rounded-lg border border-border p-4 md:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-[58ch]" />
                  <Skeleton className="h-4 w-4/5 max-w-[54ch]" />
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-[360px] w-full rounded-xl" />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </aside>
      </div>
    </main>
  );
}
