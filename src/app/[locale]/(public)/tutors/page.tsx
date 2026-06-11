import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { listFieldCategoriesWithFields } from "@/entities/field/queries";
import {
  getFieldLabelsForTutors,
  listPublicTutors,
} from "@/entities/tutor/queries";
import { getQueryClient } from "@/shared/lib/query-client";
import { tutorKeys } from "@/entities/tutor/api/tutor.query";
import { PublicTutorsModule } from "@/modules/public-tutors/PublicTutorsModule";

export const revalidate = 3600;
export const dynamic = "force-static";

const DEFAULT_LIMIT = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorsTitle") };
}

export default async function TutorsListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const defaultFilters = { page: 1, limit: DEFAULT_LIMIT } as const;

  const [categories, { tutors, totalApprox }] = await Promise.all([
    listFieldCategoriesWithFields(),
    listPublicTutors({ offset: 0, limit: DEFAULT_LIMIT }),
  ]);

  const labelMap = await getFieldLabelsForTutors(tutors.map((t) => t.id));

  const queryClient = getQueryClient();
  queryClient.setQueryData(tutorKeys.list(defaultFilters), {
    tutors: tutors.map((t) => ({
      ...t,
      fieldLabels: labelMap.get(t.id) ?? [],
    })),
    total: totalApprox,
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicTutorsModule categories={categories} initialPage={1} />
    </HydrationBoundary>
  );
}
