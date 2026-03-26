import { prisma } from "@/lib/db";
import type { CreateSpotInput, UpdateSpotInput } from "./schema";
import type { Spot } from "./types";

export async function listByOrganization(organizationId: number): Promise<Spot[]> {
  const rows = await prisma.spots.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    orderBy: { created_at: "desc" },
  });
  return rows.map((r: (typeof rows)[number]) => ({
    id: r.id,
    uuid: r.uuid,
    organization_id: r.organization_id,
    name: r.name,
    description: r.description,
  }));
}

export async function create(organizationId: number, data: CreateSpotInput) {
  return prisma.spots.create({
    data: {
      organization_id: organizationId,
      name: data.name,
      description: data.description,
    },
  });
}

export async function update(id: number, data: UpdateSpotInput) {
  return prisma.spots.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

export async function remove(id: number) {
  return prisma.spots.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}
