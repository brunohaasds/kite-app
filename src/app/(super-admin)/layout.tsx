import { SuperAdminSidebar } from "@/components/layout/super-admin-sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SuperAdminSidebar />
      <main className="p-4 pt-14 lg:ml-64 lg:pt-4">{children}</main>
    </div>
  );
}
