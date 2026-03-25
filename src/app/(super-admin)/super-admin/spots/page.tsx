export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/require-permission";
import { listAll } from "@/domain/global-spots/repo";
import { prisma } from "@/lib/db";
import { SpotsClient } from "./spots-client";

export const metadata: Metadata = {
  title: "Global Spots - Super Admin",
};

export default async function SuperAdminSpotsPage() {
  await requireSuperAdmin();

  const [spots, organizations] = await Promise.all([
    listAll(),
    prisma.organizations.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = spots.map((s) => ({
    id: s.id,
    uuid: s.uuid,
    name: s.name,
    slug: s.slug,
    access: s.access as "public" | "private",
    description: s.description,
    image: s.image,
    tips: s.tips as string[] | null,
    services: s.services as string[] | null,
    latitude: s.latitude ? Number(s.latitude) : null,
    longitude: s.longitude ? Number(s.longitude) : null,
    parent_spot_id: s.parent_spot_id,
    owner_organization_id: s.owner_organization_id,
    parent_spot: s.parent_spot,
    owner_organization: s.owner_organization,
    _count: s._count,
  }));

  const publicSpots = serialized.filter(
    (s) => s.access === "public" && !s.parent_spot_id,
  );

  return (
    <SpotsClient
      spots={serialized}
      publicSpots={publicSpots}
      organizations={organizations}
    />
  );
}
