import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SuperAdminOrgBanner } from "@/components/layout/super-admin-org-banner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const saOrgCookie = cookieStore.get("sa-org-id")?.value;

  let superAdminOrgName: string | null = null;
  if (
    session?.user?.role === "superadmin" &&
    saOrgCookie &&
    session.user.organizationId != null &&
    String(session.user.organizationId) === saOrgCookie
  ) {
    const org = await prisma.organizations.findFirst({
      where: { id: session.user.organizationId, deleted_at: null },
      select: { name: true },
    });
    superAdminOrgName = org?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="p-4 pt-14 lg:ml-64 lg:pt-4">
        {superAdminOrgName && (
          <div className="-mx-4 -mt-4 mb-4 lg:mx-0 lg:-mt-4">
            <SuperAdminOrgBanner orgName={superAdminOrgName} />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
