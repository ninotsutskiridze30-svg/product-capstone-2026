import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorCalendarDataQueryOptions } from "@/entities/calendar/api/calendar.query";
import { TutorCalendarModule } from "@/modules/tutor-calendar/TutorCalendarModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorCalendarTitle") };
}

export default async function TutorCalendarPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorCalendarDataQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorCalendarModule />
    </HydrationBoundary>
  );
}
