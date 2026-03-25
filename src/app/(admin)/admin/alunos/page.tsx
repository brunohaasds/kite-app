import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { AlunosClient } from "./alunos-client";

export default async function AlunosPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const students = await prisma.students.findMany({
    where: { organization_id: orgId, deleted_at: null },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const serialized = students.map((s) => ({
    uuid: s.uuid,
    name: s.user.name,
    email: s.user.email,
    phone: s.user.phone ?? "",
    level: s.level ?? "iniciante",
  }));

  return <AlunosClient students={serialized} />;
}
