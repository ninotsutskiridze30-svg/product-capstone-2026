"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { studentDashboardQueryOptions } from "@/entities/student/api/student.query";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Link } from "@/shared/i18n/navigation";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

export function StudentDashboardModule() {
  const t = useTranslations("dashboardStudent");
  const { data, isLoading } = useQuery(studentDashboardQueryOptions());

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const sessions = data?.sessions ?? [];
  const requests = data?.requests ?? [];
  const favs = data?.favoriteTutors ?? [];

  return (
    <div className="space-y-6 lg:space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {t("overview")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface border-border shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="font-body text-xl font-semibold">
              {t("upcomingSessions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sessions.length === 0 ? (
              <p className="text-text-muted">{t("noUpcoming")}</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between gap-2 border-b border-border pb-2 last:border-0"
                >
                  <span className="text-text-primary font-medium">{s.tutorName}</span>
                  <span className="text-text-muted">
                    {format(new Date(s.created_at), "PP", { locale: enUS })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="font-body text-xl font-semibold">
              {t("recentRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {requests.length === 0 ? (
              <p className="text-text-muted">{t("noRequests")}</p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0"
                >
                  <span className="text-text-primary">{r.tutorName}</span>
                  <Badge variant="outline" className="border-border text-text-secondary">
                    {r.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface border-border shadow-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-body text-xl font-semibold">
            {t("favoriteTutors")}
          </CardTitle>
          <Button asChild variant="outline">
            <Link href="/tutors">{t("browse")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {favs.length === 0 ? (
            <p className="text-text-muted text-sm">{t("favoriteHint")}</p>
          ) : (
            favs.map((f) => (
              <Button key={f.tutor_id} asChild variant="secondary">
                <Link href={`/tutors/${f.tutor_id}`}>{f.tutorName}</Link>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
