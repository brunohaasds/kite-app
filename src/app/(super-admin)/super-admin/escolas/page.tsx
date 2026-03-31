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
      slug: true,
      description: true,
      site: true,
      instagram: true,
      avatar: true,
      hero_image: true,
      whatsapp: true,
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
    slug: o.slug,
    description: o.description,
    site: o.site,
    instagram: o.instagram,
    avatar: o.avatar,
    hero_image: o.hero_image,
    whatsapp: o.whatsapp,
    studentCount: o._count.students,
    instructorCount: o._count.instructors,
    spotCount: o._count.spots,
  }));

  return <EscolasClient organizations={serialized} />;
}
