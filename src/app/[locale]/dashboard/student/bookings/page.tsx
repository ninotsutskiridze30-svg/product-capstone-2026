import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { studentBookingsDetailQueryOptions } from "@/entities/session/api/session.query";
import { StudentBookingsModule } from "@/modules/student-bookings/StudentBookingsModule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("studentBookingsTitle") };
}

export default async function StudentBookingsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(studentBookingsDetailQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentBookingsModule />
    </HydrationBoundary>
  );
}
