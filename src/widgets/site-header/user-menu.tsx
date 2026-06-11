"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useSignOut } from "@/entities/user/api/user.query";
import type { User } from "@/entities/user/model/user.schema";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

function getInitials(fullName: string | null, email: string | null): string {
  if (fullName) {
    const initials = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("");
    if (initials) return initials.toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
  return "";
}

export function UserMenu({ user }: { user: User }) {
  const t = useTranslations("navigation");
  const router = useRouter();
  const signOut = useSignOut();

  const displayName = user.fullName ?? user.email ?? t("dashboard");
  const initials = getInitials(user.fullName, user.email);

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.replace("/");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Sign out failed");
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={displayName}
        >
          <Avatar>
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>
              {initials || <UserIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-text-primary truncate text-sm font-medium">
            {displayName}
          </span>
          {user.email ? (
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">{t("dashboard")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={handleSignOut}
          disabled={signOut.isPending}
        >
          <LogOut className="size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
