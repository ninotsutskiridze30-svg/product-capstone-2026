"use client";

import {
  BookOpen,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Link, usePathname } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";

export type DashboardRole = "student" | "tutor";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const linksByRole: Record<DashboardRole, NavLink[]> = {
  student: [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/student/bookings", label: "Bookings", icon: BookOpen },
    { href: "/dashboard/student/homework", label: "Homework", icon: ClipboardList },
    { href: "/dashboard/student/messages", label: "Messages", icon: MessageSquare },
  ],
  tutor: [
    { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tutor/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/tutor/profile", label: "Profile", icon: User },
    { href: "/dashboard/tutor/groups", label: "Groups", icon: Users },
    { href: "/dashboard/tutor/bookings", label: "Bookings", icon: BookOpen },
    { href: "/dashboard/tutor/homework", label: "Homework", icon: ClipboardList },
    { href: "/dashboard/tutor/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/tutor/settings", label: "Settings", icon: Settings },
  ],
};

const rootHrefByRole: Record<DashboardRole, string> = {
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
};

type DashboardNavProps = {
  role: DashboardRole;
};

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const links = linksByRole[role];
  const rootHref = rootHrefByRole[role];

  return (
    <nav className="flex flex-col gap-1.5">
      {links.map((link) => {
        const active =
          link.href === rootHref
            ? pathname === link.href
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "border-primary/50 bg-primary/10 text-primary border"
                : "text-text-secondary hover:bg-muted/70 hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
