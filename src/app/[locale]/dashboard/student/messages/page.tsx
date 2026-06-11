import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/lib/query-client";
import { conversationsQueryOptions } from "@/entities/message/api/message.query";
import { currentUserQueryOptions } from "@/entities/user/api/user.query";
import { StudentMessagesModule } from "@/modules/student-messages/StudentMessagesModule";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ conversation?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("studentMessagesTitle") };
}

export default async function StudentMessagesPage({ searchParams }: Props) {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(conversationsQueryOptions()),
    queryClient.prefetchQuery(currentUserQueryOptions()),
  ]);

  const sp = searchParams ? await searchParams : {};
  const initialConversationId =
    typeof sp.conversation === "string" && /^[0-9a-f-]{36}$/i.test(sp.conversation)
      ? sp.conversation
      : undefined;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {initialConversationId !== undefined ? (
        <StudentMessagesModule initialConversationId={initialConversationId} />
      ) : (
        <StudentMessagesModule />
      )}
    </HydrationBoundary>
  );
}
