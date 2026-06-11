import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthRegisterStudentModule } from "@/modules/auth-register-student/AuthRegisterStudentModule";

export const dynamic = "force-static";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("registerStudentTitle") };
}

export default async function RegisterStudentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthRegisterStudentModule />;
}
