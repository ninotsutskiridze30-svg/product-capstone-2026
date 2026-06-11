import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { studentDashboardQueryOptions } from "@/entities/student/api/student.query";
import { currentUserQueryOptions } from "@/entities/user/api/user.query";
import { StudentDashboardModule } from "@/modules/student-dashboard/StudentDashboardModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("studentDashboardTitle") };
}

export default async function StudentDashboardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(studentDashboardQueryOptions()),
    queryClient.prefetchQuery(currentUserQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentDashboardModule />
    </HydrationBoundary>
  );
}
