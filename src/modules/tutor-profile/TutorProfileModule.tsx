"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { tutorProfileQueryOptions } from "@/entities/tutor/api/tutor-profile.query";
import { Skeleton } from "@/shared/ui/skeleton";
import { TutorProfileForm } from "./element/tutor-profile-form";

export function TutorProfileModule() {
  const t = useTranslations("dashboardTutor");
  const { data, isLoading } = useQuery(tutorProfileQueryOptions());

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  if (!data?.profile || !data?.tutor) return null;

  const tutor = {
    ...data.tutor,
    languages: data.tutor.languages ?? [],
    education: data.tutor.education as import("@/shared/types/database.types").Json,
    certifications: data.tutor.certifications as import("@/shared/types/database.types").Json,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("profileTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("profileSubtitle")}</p>
      </div>
      <TutorProfileForm
        profile={data.profile}
        tutor={tutor}
        publicUrl={data.publicUrl}
      />
    </div>
  );
}
