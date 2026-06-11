"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { tutorDashboardQueryOptions } from "@/entities/tutor/api/tutor.query";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { TutorPendingBookingActions } from "@/shared/components/tutor-pending-booking-actions";

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Skeleton className="h-20 w-72" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function TutorDashboardModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorDashboardQueryOptions());

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const overview = data;

  return (
    <div className="space-y-7 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          {t("overviewTitle")}
        </h1>
        <p className="text-text-secondary max-w-2xl text-sm leading-relaxed md:text-base">
          {t("overviewSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("activeStudents")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            {overview?.totalStudentsApprox ?? 0}
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("upcomingSessions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            {overview?.upcomingSessions ?? 0}
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("pendingBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            {overview?.pendingBookings ?? 0}
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("avgRating")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            {(overview?.rating ?? 0).toFixed(1)}
            <span className="text-text-muted text-sm font-normal">
              {" "}
              {t("reviewsSuffix", { count: overview?.reviewCount ?? 0 })}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("unreadMessages")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            {overview?.unreadMessages ?? 0}
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-xl p-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-sm font-medium tracking-wide uppercase">
              {t("monthlyEarnings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-bold text-text-primary mt-1">
            ${overview?.monthlyEarnings ?? 0}
            <Badge variant="outline" className="ml-2 text-xs font-normal border-border text-text-muted">
              {t("comingSoon")}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-body text-xl font-semibold">
              {t("upcomingCardTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(overview?.upcomingList ?? []).length === 0 ? (
              <p className="text-text-muted text-sm">{t("noneScheduled")}</p>
            ) : (
              (overview?.upcomingList ?? []).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
                >
                  <span className="text-text-primary font-medium">{s.studentName}</span>
                  <span className="text-text-muted">
                    {format(new Date(s.created_at), "PPp", { locale: enUS })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-body text-xl font-semibold">
              {t("pendingBookingRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(overview?.pendingList ?? []).length === 0 ? (
              <p className="text-text-muted text-sm">{t("caughtUp")}</p>
            ) : (
              (overview?.pendingList ?? []).map((b) => (
                <div key={b.id} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-primary font-medium">{b.studentName}</span>
                    <Badge variant="outline" className="border-border">{b.type}</Badge>
                  </div>
                  {b.proposed_start ? (
                    <p className="text-text-muted text-xs">
                      {format(new Date(b.proposed_start), "PPp", { locale: enUS })}
                      {b.proposed_end
                        ? ` – ${format(new Date(b.proposed_end), "p", { locale: enUS })}`
                        : ""}
                    </p>
                  ) : null}
                  {b.message ? (
                    <p className="text-text-secondary text-sm">{b.message}</p>
                  ) : null}
                  <Suspense fallback={null}>
                    <TutorPendingBookingActions requestId={b.id} />
                  </Suspense>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <CardTitle className="font-body text-xl font-semibold">
            {t("recentNotifications")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(overview?.notifications ?? []).length === 0 ? (
            <p className="text-text-muted text-sm">{t("noNotifications")}</p>
          ) : (
            (overview?.notifications ?? []).map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
              >
                <div>
                  <p className="text-text-primary font-medium">{n.title}</p>
                  {n.body ? (
                    <p className="text-text-secondary">{n.body}</p>
                  ) : null}
                  <p className="text-text-muted text-xs">
                    {format(new Date(n.created_at), "PPp", { locale: enUS })}
                  </p>
                </div>
                {!n.is_read ? (
                  <Badge variant="secondary">{t("newBadge")}</Badge>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
