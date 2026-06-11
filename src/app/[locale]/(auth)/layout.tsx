export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-full flex-1 flex-col justify-center py-12 items-center">
      {children}
    </div>
  );
}
