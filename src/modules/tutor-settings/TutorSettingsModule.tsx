"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { tutorSettingsQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { Skeleton } from "@/shared/ui/skeleton";
import { TutorSettingsForm } from "./element/tutor-settings-form";

export function TutorSettingsModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorSettingsQueryOptions());

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settingsTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("settingsSubtitle")}</p>
      </div>
      <TutorSettingsForm prefs={data?.prefs ?? { email_booking: true, email_message: true, push_booking: true, push_message: true }} />
    </div>
  );
}
