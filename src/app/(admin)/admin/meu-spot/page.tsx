export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/require-permission";
import { redirect } from "next/navigation";
import { findByOwnerId } from "@/domain/global-spots/repo";
import { prisma } from "@/lib/db";
import { MeuSpotClient } from "./meu-spot-client";

export const metadata: Metadata = {
  title: "Meu Spot - Admin",
};

export default async function MeuSpotPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const spot = await findByOwnerId(orgId);
  if (!spot) {
    redirect("/admin");
  }

  const approvedOrgIds: number[] = spot.permissions.map(
    (p: { organization_id: number }) => p.organization_id,
  );
  approvedOrgIds.push(orgId);

  const availableOrgs = await prisma.organizations.findMany({
    where: {
      deleted_at: null,
      id: { notIn: approvedOrgIds },
    },
    select: { id: true, name: true, avatar: true },
    orderBy: { name: "asc" },
  });

  const serialized = {
    id: spot.id,
    uuid: spot.uuid,
    name: spot.name,
    slug: spot.slug,
    access: spot.access,
    description: spot.description,
    image: spot.image,
    tips: (spot.tips as string[] | null) ?? [],
    services: (spot.services as string[] | null) ?? [],
    parent_spot: spot.parent_spot,
    permissions: spot.permissions.map(
      (p: {
        id: number;
        organization_id: number;
        organization: { id: number; name: string; avatar: string | null };
        created_at: Date;
      }) => ({
        id: p.id,
        organization_id: p.organization_id,
        organization: p.organization,
        created_at: p.created_at.toISOString(),
      }),
    ),
  };

  return (
    <MeuSpotClient
      spot={serialized}
      availableOrgs={availableOrgs}
    />
  );
}
