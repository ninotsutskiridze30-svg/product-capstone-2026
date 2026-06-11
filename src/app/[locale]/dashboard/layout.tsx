import { IncomingCallModal } from "@/widgets/call-room/incoming-call-modal";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      {children}
      <IncomingCallModal />
    </div>
  );
}
