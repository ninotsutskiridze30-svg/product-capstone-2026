"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { tutorCalendarDataQueryOptions } from "@/entities/calendar/api/calendar.query";
import { Skeleton } from "@/shared/ui/skeleton";
import { TutorCalendarEditor } from "@/widgets/calendar-widget/tutor-calendar-editor";

export function TutorCalendarModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorCalendarDataQueryOptions());

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("calendarTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("calendarSubtitle")}</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-[60vh] w-full" />
      ) : (
        <Suspense fallback={<Skeleton className="h-[60vh] w-full" />}>
          <TutorCalendarEditor
            tutorId={data?.tutorId ?? ""}
            initialEvents={data?.events ?? []}
            connectedStudents={data?.connectedStudents ?? []}
          />
        </Suspense>
      )}
    </div>
  );
}
