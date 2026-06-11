"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

type HomeStat = { value: string; label: string };
type HomeStep = { key: "search" | "book" | "learn"; title: string; description: string };
type HomeTutor = { name: string; subject: string; rating: string; rate: string; seed: string };

export const usePublicHomeService = () => {
  const t = useTranslations("home");

  const stats = useMemo<HomeStat[]>(
    () => [
      { value: t("statsTutorsValue"), label: t("statsTutorsLabel") },
      { value: t("statsSubjectsValue"), label: t("statsSubjectsLabel") },
      { value: t("statsSessionsValue"), label: t("statsSessionsLabel") },
      { value: t("statsRatingValue"), label: t("statsRatingLabel") },
    ],
    [t]
  );

  const steps = useMemo<HomeStep[]>(
    () => [
      { key: "search", title: t("stepSearchTitle"), description: t("stepSearchDescription") },
      { key: "book", title: t("stepBookTitle"), description: t("stepBookDescription") },
      { key: "learn", title: t("stepLearnTitle"), description: t("stepLearnDescription") },
    ],
    [t]
  );

  const subjects = useMemo<string[]>(
    () => [
      t("subjectMath"),
      t("subjectScience"),
      t("subjectLanguages"),
      t("subjectMusic"),
      t("subjectCoding"),
      t("subjectHistory"),
      t("subjectBusiness"),
      t("subjectTestPrep"),
    ],
    [t]
  );

  const tutors = useMemo<HomeTutor[]>(
    () => [
      {
        name: t("spotlightTutorOneName"),
        subject: t("spotlightTutorOneSubject"),
        rating: "4.9",
        rate: "$32/hr",
        seed: "Amelia",
      },
      {
        name: t("spotlightTutorTwoName"),
        subject: t("spotlightTutorTwoSubject"),
        rating: "5.0",
        rate: "$28/hr",
        seed: "Daniel",
      },
      {
        name: t("spotlightTutorThreeName"),
        subject: t("spotlightTutorThreeSubject"),
        rating: "4.8",
        rate: "$35/hr",
        seed: "Sofia",
      },
    ],
    [t]
  );

  return { stats, steps, subjects, tutors };
};
