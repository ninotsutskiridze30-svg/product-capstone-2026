import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { homeworkListQueryOptions } from "@/entities/homework";
import { StudentHomeworkModule } from "@/modules/student-homework/StudentHomeworkModule";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("studentHomeworkTitle") };
}

export default async function StudentHomeworkPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(homeworkListQueryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentHomeworkModule />
    </HydrationBoundary>
  );
}
