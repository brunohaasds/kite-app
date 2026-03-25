import { prisma } from "@/lib/db";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "./schema";
import type { Organization, OrganizationWithSpots } from "./types";

function mapOrganization(row: {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  site: string | null;
  instagram: string | null;
  avatar: string | null;
  whatsapp: string | null;
  settings: unknown;
  created_at: Date;
}): Organization {
  return {
    ...row,
    settings:
      row.settings === null || row.settings === undefined
        ? null
        : (row.settings as Record<string, unknown>),
  };
}

export async function list(): Promise<Organization[]> {
  const rows = await prisma.organizations.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });
  return rows.map(mapOrganization);
}

export async function getById(id: number): Promise<Organization | null> {
  const row = await prisma.organizations.findFirst({
    where: { id, deleted_at: null },
  });
  return row ? mapOrganization(row) : null;
}

export async function getByIdWithSpots(id: number): Promise<OrganizationWithSpots | null> {
  const row = await prisma.organizations.findFirst({
    where: { id, deleted_at: null },
    include: {
      spots: {
        where: { deleted_at: null },
        select: { id: true, name: true },
        orderBy: { created_at: "desc" },
      },
    },
  });
  if (!row) return null;
  const { spots, ...rest } = row;
  return { ...mapOrganization(rest), spots };
}

export async function create(data: CreateOrganizationInput) {
  const site = data.site === "" ? null : data.site;
  return prisma.organizations.create({
    data: {
      name: data.name,
      description: data.description,
      site: site ?? undefined,
      instagram: data.instagram,
      avatar: data.avatar,
      whatsapp: data.whatsapp,
    },
  });
}

export async function update(id: number, data: UpdateOrganizationInput) {
  const existing = await prisma.organizations.findFirst({
    where: { id, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Organização não encontrada");
  }
  const site = data.site !== undefined ? (data.site === "" ? null : data.site) : undefined;
  return prisma.organizations.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(site !== undefined && { site }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
    },
  });
}

export async function remove(id: number) {
  const existing = await prisma.organizations.findFirst({
    where: { id, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Organização não encontrada");
  }
  return prisma.organizations.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}
