import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { PacotesAdminClient } from "./pacotes-admin-client";

export default async function PacotesPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const packages = await prisma.packages.findMany({
    where: { organization_id: orgId, deleted_at: null },
    include: {
      _count: {
        select: {
          student_packages: { where: { status: "active", deleted_at: null } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const serialized = packages.map((p) => ({
    uuid: p.uuid,
    title: p.title,
    description: p.description,
    sessionCount: p.session_count,
    price: Number(p.price),
    validityDays: p.validity_days,
    active: p.active,
    activeStudents: p._count.student_packages,
  }));

  return <PacotesAdminClient packages={serialized} />;
}
