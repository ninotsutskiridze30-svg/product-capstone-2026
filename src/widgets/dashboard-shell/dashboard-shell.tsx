"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { useCurrentUser } from "@/entities/user/api/user.query";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { Link } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { DashboardNav, type DashboardRole } from "@/widgets/dashboard-shell/dashboard-nav";
import { NotificationsBell } from "@/widgets/site-header/notifications-bell";
import { UserMenu } from "@/widgets/site-header/user-menu";

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
};

const roleConfig: Record<
  DashboardRole,
  {
    sidebarLabel: string;
    bottomCta: { expanded: string; collapsed: string; href: string };
  }
> = {
  student: {
    sidebarLabel: "Student",
    bottomCta: { expanded: "Find tutors", collapsed: "Tutors", href: "/tutors" },
  },
  tutor: {
    sidebarLabel: "Tutor",
    bottomCta: { expanded: "Public directory", collapsed: "Directory", href: "/tutors" },
  },
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  const t = useTranslations("navigation");
  const { data: currentUser } = useCurrentUser();
  const user = currentUser?.user ?? null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const config = roleConfig[role];

  return (
    <div className="bg-background/70 min-h-screen">
      <div
        className={cn(
          "fixed inset-0 z-[300] bg-black/40 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "bg-surface border-border fixed inset-y-0 left-0 z-[400] flex h-screen flex-col border-r shadow-xl transition-all duration-200 lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          desktopExpanded ? "w-72 lg:w-60" : "w-72 lg:w-20"
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div
            className={cn(
              "border-border flex min-h-[64px] items-center justify-between gap-2 border-b px-4 py-3",
              desktopExpanded ? "lg:px-4" : "lg:px-2.5"
            )}
          >
            <p
              className={cn(
                "text-text-muted text-xs font-medium tracking-wide uppercase",
                !desktopExpanded && "lg:sr-only"
              )}
            >
              {config.sidebarLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hidden lg:inline-flex"
                onClick={() => setDesktopExpanded((prev) => !prev)}
                aria-label={
                  desktopExpanded ? "Collapse sidebar" : "Expand sidebar"
                }
              >
                {desktopExpanded ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-4 md:py-5",
              !desktopExpanded &&
                "lg:[&_a]:justify-center lg:[&_a]:px-0 lg:[&_a]:gap-0 lg:[&_a_span]:sr-only lg:[&_a]:border-l-0"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <DashboardNav role={role} />
          </div>

          <div className="border-border border-t px-3 py-4 md:px-4">
            <Button asChild variant="outline" className="w-full">
              <Link href={config.bottomCta.href}>
                {desktopExpanded ? config.bottomCta.expanded : config.bottomCta.collapsed}
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen transition-[margin-left] duration-200",
          desktopExpanded ? "lg:ml-60" : "lg:ml-20"
        )}
      >
        <header className="bg-surface/85 border-border sticky top-0 z-30 border-b backdrop-blur">
          <div className="flex min-h-[64px] items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="font-display text-text-primary text-base font-semibold tracking-tight"
              >
                {t("brand")}
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">{t("dashboardHome")}</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tutors">{t("browseTutors")}</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeSwitcher />
              <NotificationsBell />
              {user ? <UserMenu user={user} /> : null}
            </div>
          </div>
        </header>

        <div className="border-border bg-background/80 border-b px-4 py-3 md:px-6 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
            Menu
          </Button>
        </div>

        <main className="min-w-0 px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
