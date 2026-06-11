"use client";

import { format } from "date-fns";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { tutorDetailQueryOptions } from "@/entities/tutor/api/tutor.query";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { PublicTutorCalendar } from "@/widgets/calendar-widget/public-tutor-calendar";
import type { CalendarEventBaseRow } from "@/shared/lib/calendar-recurrence";
import { FavoriteTutorButton } from "./element/favorite-tutor-button";
import { RequestTutorConnectionButton } from "./element/request-tutor-connection-button";
import { TutorProfileSkeleton } from "./element/tutor-profile-skeleton";

interface Props {
  tutorId: string;
  calendarEvents: CalendarEventBaseRow[];
}

export function PublicTutorProfileModule({ tutorId, calendarEvents }: Props) {
  const t = useTranslations("tutorProfile");
  const { data: tutorData, isLoading } = useQuery(tutorDetailQueryOptions(tutorId));

  if (isLoading) {
    return <TutorProfileSkeleton />;
  }

  const detail = (tutorData as { detail: NonNullable<unknown> })?.detail as {
    profile: { full_name: string | null; avatar_url: string | null; city: string | null; country: string | null; phone: string | null; bio: string | null };
    tutor: { headline: string | null; is_verified: boolean; rating: number; review_count: number; languages: string[] | null; education: unknown; certifications: unknown };
    fields: Array<{ field_id: string; name: string; proficiency_level: string | null; years_of_experience: number | null }>;
    images: Array<{ id: string; url: string; type: string }>;
    reviews: Array<{ id: string; studentLabel: string; created_at: string; rating: number; content: string | null }>;
    ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  } | null;

  if (!detail) return null;

  const cover = detail.images.find((i) => i.type === "cover");
  const gallery = detail.images.filter((i) => i.type === "gallery");

  return (
    <main className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 py-12 md:py-20">
      <div className="bg-surface relative overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="bg-gray-100 relative aspect-[21/8] w-full">
          {cover ? (
            <Image
              src={cover.url}
              alt={`${detail.profile.full_name ?? "Tutor"} cover`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 1120px, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="bg-surface/95 supports-backdrop-filter:bg-surface/80 absolute bottom-0 left-0 flex w-full items-end gap-4 border-t border-border p-4 md:p-6 backdrop-blur">
          <div className="bg-gray-100 relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full border border-border shadow-md">
            {detail.profile.avatar_url ? (
              <Image
                src={detail.profile.avatar_url}
                alt={detail.profile.full_name ?? "Tutor"}
                fill
                unoptimized
                sizes="120px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-text-primary text-4xl font-bold tracking-tight">
                {detail.profile.full_name ?? "Tutor"}
              </h1>
              {detail.tutor.is_verified ? (
                <Badge variant="secondary" className="inline-flex items-center gap-2 bg-success-bg text-success">
                  {t("verified")}
                </Badge>
              ) : null}
            </div>
            <p className="font-body text-text-secondary mt-1">{detail.tutor.headline}</p>
            <div className="text-text-secondary mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-mono text-accent flex items-center gap-1 font-bold">
                <Star className="text-accent size-4 fill-current" />
                {detail.tutor.rating.toFixed(1)} ({detail.tutor.review_count}{" "}
                {t("reviews")})
              </span>
              {detail.profile.city ? (
                <span>
                  {detail.profile.city}
                  {detail.profile.country ? `, ${detail.profile.country}` : ""}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="space-y-3">
            <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("about")}</h2>
            <p className="text-text-secondary max-w-[65ch] whitespace-pre-wrap leading-relaxed">
              {detail.profile.bio ?? t("noBio")}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("subjects")}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {detail.fields.map((f) => (
                <li key={f.field_id} className="bg-surface flex flex-col rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-text-primary font-medium">{f.name}</span>
                  <span className="text-text-muted text-xs">
                    {f.proficiency_level ?? "—"}
                    {f.years_of_experience != null ? ` · ${f.years_of_experience} yrs` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("educationCerts")}</h2>
            <div className="text-text-secondary grid gap-3 text-sm">
              <div>
                <span className="text-text-primary font-medium">{t("education")}</span>
                <p className="mt-1">
                  {Array.isArray(detail.tutor.education) && detail.tutor.education.length > 0
                    ? JSON.stringify(detail.tutor.education)
                    : t("notListed" as never) ?? "Not listed"}
                </p>
              </div>
              <div>
                <span className="text-text-primary font-medium">{t("certifications")}</span>
                <p className="mt-1">
                  {Array.isArray(detail.tutor.certifications) && detail.tutor.certifications.length > 0
                    ? JSON.stringify(detail.tutor.certifications)
                    : t("notListed" as never) ?? "Not listed"}
                </p>
              </div>
            </div>
          </section>

          {detail.tutor.languages?.length ? (
            <section className="space-y-2">
              <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("languages")}</h2>
              <div className="flex flex-wrap gap-2">
                {detail.tutor.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="bg-primary/10 text-primary rounded-full border-0 px-3 py-1">
                    {lang}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {gallery.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("gallery")}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gallery.map((img) => (
                  <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg border border-border">
                    <Image src={img.url} alt={`${detail.profile.full_name ?? "Tutor"} gallery`} fill unoptimized sizes="(min-width: 640px) 30vw, 48vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("reviews")}</h2>
              <div className="text-text-muted flex gap-3 text-xs">
                {[5, 4, 3, 2, 1].map((n) => (
                  <span key={n}>{n}★: {detail.ratingBreakdown[n as 1 | 2 | 3 | 4 | 5]}</span>
                ))}
              </div>
            </div>
            <ul className="space-y-3">
              {detail.reviews.length === 0 ? (
                <li className="text-text-muted text-sm">{t("noReviews")}</li>
              ) : (
                detail.reviews.map((r) => (
                  <li key={r.id} className="bg-surface rounded-lg border border-border p-4 md:p-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-primary font-medium">{r.studentLabel}</span>
                      <span className="text-text-muted">{format(new Date(r.created_at), "PP")}</span>
                      <span className="font-mono text-accent flex items-center gap-0.5 font-bold">
                        <Star className="text-accent size-3.5 fill-current" />
                        {r.rating}
                      </span>
                    </div>
                    {r.content ? <p className="text-text-secondary mt-2 text-sm">{r.content}</p> : null}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section id="availability" className="space-y-3 scroll-mt-24">
            <h2 className="font-body text-2xl lg:text-3xl font-semibold leading-snug">{t("availability")}</h2>
            <p className="text-text-muted text-sm">{t("availabilityHelp")}</p>
            <PublicTutorCalendar events={calendarEvents} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="font-body text-xl font-semibold">{t("contact")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {detail.profile.phone ? (
                <div>
                  <span className="text-text-muted">{t("phoneLabel")}</span>
                  <p className="text-text-primary font-medium">{detail.profile.phone}</p>
                </div>
              ) : (
                <p className="text-text-muted">{t("phoneOnRequest")}</p>
              )}
              <Separator />
              <p className="text-text-muted text-xs">{t("emailHint")}</p>
              <RequestTutorConnectionButton tutorId={tutorId} />
              <FavoriteTutorButton tutorId={tutorId} initialFavorited={false} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
