import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TutorMessagesModule } from "@/modules/tutor-messages/TutorMessagesModule";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ conversation?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("tutorMessagesTitle") };
}

export default async function TutorMessagesPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const initialConversationId =
    typeof sp.conversation === "string" && /^[0-9a-f-]{36}$/i.test(sp.conversation)
      ? sp.conversation
      : undefined;

  return initialConversationId !== undefined ? (
    <TutorMessagesModule initialConversationId={initialConversationId} />
  ) : (
    <TutorMessagesModule />
  );
}
