"use client";

import { useLocale, useTranslations } from "next-intl";
import { track } from "@/shared/lib/analytics/events";

import { Link } from "@/shared/i18n/navigation";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function RegisterRolePicker() {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("chooseRoleTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("chooseRoleSubtitle")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("studentCardTitle")}</CardTitle>
            <CardDescription>
              {t("studentCardBody")}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button asChild className="w-full" onClick={() => void track("signup_started", { locale, role: "student" })}>
              <Link href="/register/student">{t("createStudentAccount")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("tutorCardTitle")}</CardTitle>
            <CardDescription>
              {t("tutorCardBody")}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button asChild variant="secondary" className="w-full" onClick={() => void track("signup_started", { locale, role: "tutor" })}>
              <Link href="/register/tutor">{t("createTutorAccount")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-muted-foreground text-center text-sm">
        {t("alreadyHaveAccountQuestion")}{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
