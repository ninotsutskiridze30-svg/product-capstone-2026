import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { z } from "zod";

import {
  getTutorPublicDetail,
  getTutorCalendarEvents,
  listPublicTutors,
} from "@/entities/tutor/queries";
import type { CalendarEventBaseRow } from "@/shared/lib/calendar-recurrence";
import { tutorKeys } from "@/entities/tutor/api/tutor.query";
import { getQueryClient } from "@/shared/lib/query-client";
import { routing } from "@/shared/i18n/routing";
import { PublicTutorProfileModule } from "@/modules/public-tutor-profile/PublicTutorProfileModule";

export const revalidate = 3600;
export const dynamicParams = true;
export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string; locale: string }> };

const uuidSchema = z.string().uuid();

const PRERENDER_LIMIT = 20;

export async function generateStaticParams() {
  try {
    const { tutors } = await listPublicTutors({ limit: PRERENDER_LIMIT });
    return routing.locales.flatMap((locale) =>
      tutors.map((t) => ({ locale, slug: t.id }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!uuidSchema.safeParse(slug).success) {
    return { title: "Tutor | TutorLink" };
  }
  const detail = await getTutorPublicDetail(slug);
  const name = detail?.profile.full_name ?? "Tutor";
  return {
    title: `${name} | TutorLink`,
    description: detail?.tutor.headline ?? undefined,
  };
}

export default async function TutorPublicProfilePage({ params }: Props) {
  const { slug: tutorId, locale } = await params;
  setRequestLocale(locale);

  if (!uuidSchema.safeParse(tutorId).success) {
    notFound();
  }

  const detail = await getTutorPublicDetail(tutorId);
  if (!detail) {
    notFound();
  }

  const calendarRaw = (await getTutorCalendarEvents(tutorId, {
    forPublicView: true,
  })) as CalendarEventBaseRow[];

  const queryClient = getQueryClient();
  queryClient.setQueryData(tutorKeys.detail(tutorId), { detail });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicTutorProfileModule
        tutorId={tutorId}
        calendarEvents={calendarRaw}
      />
    </HydrationBoundary>
  );
}
