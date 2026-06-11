import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  homeworkListQueryOptions,
  homeworkRecipientsQueryOptions,
} from "@/entities/homework";
import { TutorHomeworkModule } from "@/modules/tutor-homework/TutorHomeworkModule";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorHomeworkTitle") };
}

export default async function TutorHomeworkPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(homeworkListQueryOptions()),
    queryClient.prefetchQuery(homeworkRecipientsQueryOptions()),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorHomeworkModule />
    </HydrationBoundary>
  );
}
