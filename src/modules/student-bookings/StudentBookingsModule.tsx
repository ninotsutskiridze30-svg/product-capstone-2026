"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { studentBookingsDetailQueryOptions } from "@/entities/session/api/session.query";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ReviewSessionDialog } from "./element/review-session-dialog";
import { StudentPendingBookingRow } from "./element/student-pending-booking-actions";

export function StudentBookingsModule() {
  const t = useTranslations("dashboardStudent");
  const { data, isLoading } = useQuery(studentBookingsDetailQueryOptions());

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  const pendingRequests = data?.pendingRequests ?? [];
  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const reviewedIds = new Set(data?.reviewedSessionIds ?? []);

  return (
    <div className="space-y-6 lg:space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {t("bookingsTitle")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          {t("bookingsSubtitle")}
        </p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t("tabPending")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("tabUpcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("tabPast")}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 pt-4">
          {pendingRequests.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 text-sm">
                <StudentPendingBookingRow
                  row={{
                    id: r.id,
                    tutor_id: r.tutor_id,
                    type: r.type as "online" | "onsite",
                    proposed_start: r.proposed_start,
                    proposed_end: r.proposed_end,
                    message: r.message,
                    initiated_by: r.initiated_by,
                    requested_slots: r.requested_slots,
                  }}
                  tutorName={r.peerName ?? "Tutor"}
                />
              </CardContent>
            </Card>
          ))}
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noPendingRequests")}</p>
          ) : null}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-3 pt-4">
          {upcoming.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-4 text-sm">
                <span className="font-medium">{s.peerName}</span> · {s.type} ·{" "}
                {format(new Date(s.created_at), "PP", { locale: enUS })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past" className="space-y-3 pt-4">
          {past.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm">
                <div>
                  <span className="font-medium">{s.peerName}</span> ·{" "}
                  {format(new Date(s.created_at), "PP", { locale: enUS })}
                </div>
                {!reviewedIds.has(s.id) ? (
                  <ReviewSessionDialog sessionId={s.id} tutorId={s.tutor_id} />
                ) : (
                  <Badge variant="secondary">{t("reviewed")}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
