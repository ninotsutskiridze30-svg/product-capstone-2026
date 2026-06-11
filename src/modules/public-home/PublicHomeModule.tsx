"use client";

import { useTranslations } from "next-intl";
import { HomeFinalCta } from "./element/home-final-cta";
import { HomeFooter } from "./element/home-footer";
import { HomeHero } from "./element/home-hero";
import { HomeHowItWorks } from "./element/home-how-it-works";
import { HomeStats } from "./element/home-stats";
import { HomeSubjectCategories } from "./element/home-subject-categories";
import { HomeTutorSpotlight } from "./element/home-tutor-spotlight";
import { usePublicHomeService } from "./public-home.service";

export function PublicHomeModule() {
  const t = useTranslations("home");
  const { stats, steps, subjects, tutors } = usePublicHomeService();

  return (
    <main className="relative isolate overflow-hidden bg-gradient-to-b from-background via-[#f4f9f5] to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <div className="absolute -top-16 left-10 h-72 w-72 rounded-full bg-[#2D5A3D]/15 blur-3xl" />
        <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#2D5A3D]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 lg:px-8">
        <HomeHero
          badge={t("heroBadge")}
          title={t("heroTitle")}
          subtitle={t("heroSubtitle")}
          browseTutorsLabel={t("browseTutors")}
          getStartedLabel={t("getStarted")}
          signInLabel={t("signIn")}
          socialProof={t("heroSocialProof")}
          rating={t("heroRating")}
          tutors={tutors}
        />

        <HomeStats items={stats} />
        <HomeHowItWorks title={t("howItWorksTitle")} subtitle={t("howItWorksSubtitle")} steps={steps} />
        <HomeSubjectCategories
          title={t("subjectsTitle")}
          subtitle={t("subjectsSubtitle")}
          subjects={subjects}
        />
        <HomeTutorSpotlight
          title={t("spotlightTitle")}
          subtitle={t("spotlightSubtitle")}
          tutors={tutors}
        />
        <HomeFinalCta
          title={t("finalCtaTitle")}
          subtitle={t("finalCtaSubtitle")}
          ctaLabel={t("finalCtaButton")}
        />
      </div>

      <HomeFooter />
    </main>
  );
}
