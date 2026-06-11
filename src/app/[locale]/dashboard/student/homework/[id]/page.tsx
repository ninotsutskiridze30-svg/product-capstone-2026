import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { homeworkDetailQueryOptions } from "@/entities/homework";
import { StudentHomeworkDetailModule } from "@/modules/student-homework/StudentHomeworkDetailModule";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("studentHomeworkTitle") };
}

export default async function StudentHomeworkDetailPage({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(homeworkDetailQueryOptions(id));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentHomeworkDetailModule id={id} />
    </HydrationBoundary>
  );
}
