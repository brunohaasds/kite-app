import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="p-4 pt-14 lg:ml-64 lg:pt-4">{children}</main>
    </div>
  );
}
