export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { EscolasClient } from "./escolas-client";

export const metadata: Metadata = {
  title: "Escolas - Super Admin",
};

export default async function SuperAdminEscolasPage() {
  await requireSuperAdmin();

  const organizations = await prisma.organizations.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      name: true,
      avatar: true,
      _count: {
        select: {
          students: { where: { deleted_at: null } },
          instructors: { where: { deleted_at: null } },
          spots: { where: { deleted_at: null } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = organizations.map((o) => ({
    id: o.id,
    name: o.name,
    avatar: o.avatar,
    studentCount: o._count.students,
    instructorCount: o._count.instructors,
    spotCount: o._count.spots,
  }));

  return <EscolasClient organizations={serialized} />;
}
