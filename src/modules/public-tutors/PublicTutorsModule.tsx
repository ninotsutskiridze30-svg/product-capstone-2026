"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { tutorListQueryOptions } from "@/entities/tutor/api/tutor.query";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { TutorCard } from "./element/tutor-card";
import { TutorFilters } from "./element/tutor-filters";
import { TutorsListSkeleton } from "./element/tutors-list-skeleton";
import type { TutorFilters as TutorFiltersType } from "@/shared/lib/query-keys";
import type { FieldCategoryWithFieldsRow } from "@/entities/field/queries";

interface Props {
  categories: FieldCategoryWithFieldsRow[];
  initialPage?: number;
}

function buildTutorsHref(sp: URLSearchParams, pageNum: number): string {
  const p = new URLSearchParams(sp.toString());
  p.set("page", String(pageNum));
  return `/tutors?${p.toString()}`;
}

export function PublicTutorsModule({ categories, initialPage = 1 }: Props) {
  const t = useTranslations("tutorsListing");
  const searchParams = useSearchParams();

  const page = Math.max(
    1,
    Number(searchParams.get("page") ?? String(initialPage)) || 1
  );
  const limit = 12;

  const filters: TutorFiltersType = { page, limit };

  const q = searchParams.get("q");
  if (q) filters.q = q;
  const field = searchParams.get("field");
  if (field) filters.field = field;
  const city = searchParams.get("city");
  if (city) filters.city = city;
  const language = searchParams.get("lang");
  if (language) filters.language = language;
  const date = searchParams.get("date");
  if (date) filters.date = date;

  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  if (priceMin && priceMax) {
    filters.priceMin = Number(priceMin);
    filters.priceMax = Number(priceMax);
  }

  const minRatingRaw = searchParams.get("minRating");
  if (minRatingRaw && minRatingRaw !== "__any__") {
    filters.rating = Number(minRatingRaw);
  }

  const { data, isLoading } = useQuery(tutorListQueryOptions(filters));

  const tutors = data?.tutors ?? [];
  const total = data?.total ?? 0;
  const hasNext = (page - 1) * limit + tutors.length < total;

  if (isLoading) {
    return <TutorsListSkeleton />;
  }

  return (
    <main className="max-w-7xl mx-auto py-12 md:py-20">
      <div className="space-y-6">
        <Suspense fallback={<div className="skeleton min-h-24 rounded-xl border border-border p-4 md:p-6" />}>
          <TutorFilters categories={categories} />
        </Suspense>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
              {t("title")}
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              {t("matchCount", { count: total })}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                fieldLabels={tutor.fieldLabels ?? []}
              />
            ))}
          </div>
          {tutors.length === 0 ? (
            <p className="text-text-muted text-sm">{t("empty")}</p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            {page > 1 ? (
              <Button asChild variant="outline">
                <Link href={buildTutorsHref(searchParams, page - 1)}>{t("previous")}</Link>
              </Button>
            ) : null}
            {hasNext ? (
              <Button asChild variant="outline">
                <Link href={buildTutorsHref(searchParams, page + 1)}>{t("next")}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
