"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import type { PublicTutorRow } from "@/entities/tutor/queries";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Star } from "lucide-react";

type Props = {
  tutor: PublicTutorRow;
  fieldLabels: string[];
};

export function TutorCard({ tutor, fieldLabels }: Props) {
  const t = useTranslations("tutorCard");
  const common = useTranslations("common");
  const p = tutor.profiles;
  const displayName = p?.full_name ?? common("tutor");
  const location = [p?.city, p?.country].filter(Boolean).join(", ");
  const min = tutor.hourly_rate_min;
  const max = tutor.hourly_rate_max;
  const priceLabel =
    min != null && max != null
      ? t("rateRange", { min, max })
      : min != null
        ? t("fromRate", { min })
        : t("rateOnRequest");

  return (
    <Card className="bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden rounded-xl border border-border transition-all duration-200">
      <CardContent className="p-0">
        <Link href={`/tutors/${tutor.id}`} className="block space-y-4 p-4 md:p-6">
          <div className="flex gap-3">
            <div className="bg-gray-100 relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              {p?.avatar_url ? (
                <Image
                  src={p.avatar_url}
                  alt={displayName}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-text-primary truncate text-lg font-bold">
                  {displayName}
                </h2>
                {tutor.is_verified ? (
                  <Badge
                    variant="secondary"
                    className="font-body bg-success-bg text-success text-xs"
                  >
                    {t("verified")}
                  </Badge>
                ) : null}
              </div>
              <p className="font-body text-text-secondary line-clamp-2 text-sm">
                {tutor.headline ?? t("experiencedTutor")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldLabels.slice(0, 4).map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="font-body bg-primary/10 text-primary rounded-full border-0 px-3 py-1 text-xs font-medium tracking-wide"
              >
                {label}
              </Badge>
            ))}
            {fieldLabels.length > 4 ? (
              <Badge
                variant="outline"
                className="font-body bg-primary/10 text-primary rounded-full border-0 px-3 py-1 text-xs font-medium tracking-wide"
              >
                {t("moreFields", { count: fieldLabels.length - 4 })}
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-mono text-accent flex items-center gap-1 text-sm font-bold">
              <Star className="text-accent size-3.5 fill-current" />
              {tutor.rating.toFixed(1)} ({tutor.review_count})
            </span>
            <span className="font-mono text-primary text-xl font-bold">
              {priceLabel}
            </span>
            {location ? (
              <span className="font-body text-text-secondary">{location}</span>
            ) : null}
            <Badge
              variant="outline"
              className="font-body text-text-muted border-border text-xs"
            >
              {t("onlineOnsite")}
            </Badge>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
