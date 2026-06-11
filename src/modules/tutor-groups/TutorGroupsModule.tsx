"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { tutorGroupsQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { CreateGroupDialog } from "./element/create-group-dialog";

export function TutorGroupsModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorGroupsQueryOptions());

  const groups = data?.groups ?? [];
  const fields = data?.fields ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("groupsTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t("groupsSubtitle")}</p>
        </div>
        {!isLoading && data?.tutorId ? (
          <CreateGroupDialog fields={fields} tutorId={data.tutorId} />
        ) : null}
      </div>
      {isLoading ? (
        <Skeleton className="h-[40vh] w-full" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-base">{g.name}</CardTitle>
                <Badge variant={g.is_active ? "secondary" : "outline"}>
                  {g.is_active ? t("active") : t("inactive")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {g.fieldName} · {t("groupStudents", { current: g.current_count, max: g.max_students })}
                </p>
                {g.description ? <p>{g.description}</p> : null}
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("groupsEmpty")}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
