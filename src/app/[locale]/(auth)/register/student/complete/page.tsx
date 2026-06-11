import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { studentCompleteDataQueryOptions } from "@/entities/user/api/user.query";
import { AuthCompleteStudentModule } from "@/modules/auth-complete-student/AuthCompleteStudentModule";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("registerStudentCompleteTitle") };
}

export default async function RegisterStudentCompletePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(studentCompleteDataQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthCompleteStudentModule />
    </HydrationBoundary>
  );
}
