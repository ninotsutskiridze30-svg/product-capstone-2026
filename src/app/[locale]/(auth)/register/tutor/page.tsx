import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthRegisterTutorModule } from "@/modules/auth-register-tutor/AuthRegisterTutorModule";

export const dynamic = "force-static";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("registerTutorTitle") };
}

export default async function RegisterTutorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthRegisterTutorModule />;
}
