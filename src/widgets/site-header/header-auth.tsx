"use client";

import { useTranslations } from "next-intl";

import { useCurrentUser } from "@/entities/user/api/user.query";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { NotificationsBell } from "@/widgets/site-header/notifications-bell";
import { UserMenu } from "@/widgets/site-header/user-menu";

export function HeaderAuth() {
  const t = useTranslations("navigation");
  const { data, isPending } = useCurrentUser();
  const user = data?.user ?? null;

  if (user) {
    return (
      <>
        <NotificationsBell />
        <UserMenu user={user} />
      </>
    );
  }

  // First load: don't flash the signed-out buttons before the session resolves.
  // An errored query falls through to the signed-out state (isPending === false).
  if (isPending) {
    return <Skeleton className="size-9 rounded-full" aria-hidden />;
  }

  return (
    <>
      <Button asChild size="sm" variant="ghost" className="rounded-full px-4">
        <Link href="/login">{t("signIn")}</Link>
      </Button>
      <Button asChild size="sm" className="rounded-full px-5">
        <Link href="/register">{t("register")}</Link>
      </Button>
    </>
  );
}
