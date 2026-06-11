import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorSettingsQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { TutorSettingsModule } from "@/modules/tutor-settings/TutorSettingsModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorSettingsTitle") };
}

export default async function TutorSettingsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorSettingsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorSettingsModule />
    </HydrationBoundary>
  );
}
