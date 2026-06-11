import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorCompleteDataQueryOptions } from "@/entities/user/api/user.query";
import { AuthCompleteTutorModule } from "@/modules/auth-complete-tutor/AuthCompleteTutorModule";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("registerTutorCompleteTitle") };
}

export default async function RegisterTutorCompletePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorCompleteDataQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthCompleteTutorModule />
    </HydrationBoundary>
  );
}
