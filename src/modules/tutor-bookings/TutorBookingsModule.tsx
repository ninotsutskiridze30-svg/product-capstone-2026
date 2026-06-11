"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { tutorBookingsDetailQueryOptions } from "@/entities/session/api/session.query";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TutorPendingBookingActions } from "@/shared/components/tutor-pending-booking-actions";

export function TutorBookingsModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorBookingsDetailQueryOptions());

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  const pending = data?.pending ?? [];
  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const cancelled = data?.cancelled ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("bookingsTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("bookingsSubtitle")}</p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t("tabPending")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("tabUpcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("tabPast")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("tabCancelled")}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 pt-4">
          {pending.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{b.peerName}</CardTitle>
                <Badge variant="outline">{b.type}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {b.initiated_by === "tutor" ? (
                  <p className="text-muted-foreground text-xs">
                    Lesson invite — waiting for the student to accept or decline.
                  </p>
                ) : null}
                {b.proposed_start ? (
                  <p className="text-muted-foreground">
                    {format(new Date(b.proposed_start), "PPp", { locale: enUS })}
                  </p>
                ) : null}
                {b.message ? <p>{b.message}</p> : null}
                {b.initiated_by === "student" ? (
                  <Suspense fallback={null}>
                    <TutorPendingBookingActions requestId={b.id} />
                  </Suspense>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noPending")}</p>
          ) : null}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-3 pt-4">
          {upcoming.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-4 text-sm">
                <span className="font-medium">{s.peerName}</span> · {s.type} ·{" "}
                {s.status} ·{" "}
                {format(new Date(s.created_at), "PP", { locale: enUS })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past" className="space-y-3 pt-4">
          {past.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-4 text-sm">
                <span className="font-medium">{s.peerName}</span> ·{" "}
                {format(new Date(s.created_at), "PP", { locale: enUS })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-3 pt-4">
          {cancelled.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-4 text-sm">
                <span className="font-medium">{s.peerName}</span> ·{" "}
                {format(new Date(s.created_at), "PP", { locale: enUS })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
