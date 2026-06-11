import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { homeworkDetailQueryOptions } from "@/entities/homework";
import { TutorHomeworkDetailModule } from "@/modules/tutor-homework/TutorHomeworkDetailModule";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorHomeworkTitle") };
}

export default async function TutorHomeworkDetailPage({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(homeworkDetailQueryOptions(id));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorHomeworkDetailModule id={id} />
    </HydrationBoundary>
  );
}
