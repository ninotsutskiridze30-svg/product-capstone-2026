import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PublicHomeModule } from "@/modules/public-home/PublicHomeModule";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PublicHomeModule />;
}
