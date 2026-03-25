export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { AlunosClient } from "./alunos-client";

export const metadata: Metadata = {
  title: "Alunos - Super Admin",
};

export default async function SuperAdminAlunosPage() {
  await requireSuperAdmin();

  const [students, organizations] = await Promise.all([
    prisma.students.findMany({
      where: { deleted_at: null },
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.organizations.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = students.map((s) => ({
    id: s.id,
    uuid: s.uuid,
    name: s.user.name,
    email: s.user.email,
    level: s.level,
    organizationId: s.organization.id,
    organizationName: s.organization.name,
  }));

  return (
    <AlunosClient
      students={serialized}
      organizations={organizations}
    />
  );
}
