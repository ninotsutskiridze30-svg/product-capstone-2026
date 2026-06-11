import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorGroupsQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { TutorGroupsModule } from "@/modules/tutor-groups/TutorGroupsModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorGroupsTitle") };
}

export default async function TutorGroupsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorGroupsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorGroupsModule />
    </HydrationBoundary>
  );
}
