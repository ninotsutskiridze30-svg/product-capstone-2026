import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorDashboardQueryOptions } from "@/entities/tutor/api/tutor.query";
import { currentUserQueryOptions } from "@/entities/user/api/user.query";
import { TutorDashboardModule } from "@/modules/tutor-dashboard/TutorDashboardModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorDashboardTitle") };
}

export default async function TutorDashboardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(tutorDashboardQueryOptions()),
    queryClient.prefetchQuery(currentUserQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorDashboardModule />
    </HydrationBoundary>
  );
}
