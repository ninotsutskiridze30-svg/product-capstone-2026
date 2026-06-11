import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorBookingsDetailQueryOptions } from "@/entities/session/api/session.query";
import { TutorBookingsModule } from "@/modules/tutor-bookings/TutorBookingsModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorBookingsTitle") };
}

export default async function TutorBookingsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorBookingsDetailQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorBookingsModule />
    </HydrationBoundary>
  );
}
