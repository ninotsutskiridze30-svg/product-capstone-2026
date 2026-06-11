import { DashboardShell } from "@/widgets/dashboard-shell/dashboard-shell";

// Auth + role enforcement is handled in proxy.ts middleware.
// Only authenticated tutors can reach this layout.
export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="tutor">{children}</DashboardShell>;
}
