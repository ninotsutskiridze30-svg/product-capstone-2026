import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { tutorProfileQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { TutorProfileModule } from "@/modules/tutor-profile/TutorProfileModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorProfileEditTitle") };
}

export default async function TutorProfilePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(tutorProfileQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TutorProfileModule />
    </HydrationBoundary>
  );
}
