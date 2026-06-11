import { DashboardShell } from "@/widgets/dashboard-shell/dashboard-shell";

// Auth + role enforcement is handled in proxy.ts middleware.
// Only authenticated students can reach this layout.
export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="student">{children}</DashboardShell>;
}
