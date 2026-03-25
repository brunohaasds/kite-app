export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { UsuariosClient } from "./usuarios-client";

export const metadata: Metadata = {
  title: "Usuários - Super Admin",
};

export default async function SuperAdminUsuariosPage() {
  const session = await requireSuperAdmin();
  const currentUserId = Number(session.user.id);

  const [users, organizations] = await Promise.all([
    prisma.users.findMany({
      where: { deleted_at: null },
      include: {
        members: {
          where: { deleted_at: null },
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.organizations.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = users.map((u) => ({
    id: u.id,
    uuid: u.uuid,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    lastLoginAt: u.last_login_at?.toISOString() ?? null,
    organizations: u.members.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
    })),
  }));

  return (
    <UsuariosClient
      users={serialized}
      organizations={organizations}
      currentUserId={currentUserId}
    />
  );
}
