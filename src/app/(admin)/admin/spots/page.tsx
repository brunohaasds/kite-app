export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/require-permission";
import { listAvailableForOrg, getLinkedSpots } from "@/domain/global-spots/repo";
import { SpotsClient } from "./spots-client";

export const metadata: Metadata = {
  title: "Spots - Admin",
};

export default async function SpotsPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const [availableSpots, linkedSpots] = await Promise.all([
    listAvailableForOrg(orgId),
    getLinkedSpots(orgId),
  ]);

  type Avail = (typeof availableSpots)[number];
  const serialized = availableSpots.map((s: Avail) => ({
    id: s.id,
    uuid: s.uuid,
    name: s.name,
    slug: s.slug,
    access: s.access as "public" | "private",
    description: s.description,
    image: s.image,
    parent_spot: s.parent_spot,
    owner_organization: s.owner_organization,
  }));

  type Linked = (typeof linkedSpots)[number];
  const linkedIds = new Set(
    linkedSpots.map((l: Linked) => l.global_spot_id),
  );
  const linkedMap = Object.fromEntries(
    linkedSpots.map((l: Linked) => [l.global_spot_id!, l.id]),
  );

  return (
    <SpotsClient
      globalSpots={serialized}
      linkedGlobalSpotIds={Array.from(linkedIds) as number[]}
      linkedSpotMap={linkedMap}
    />
  );
}
