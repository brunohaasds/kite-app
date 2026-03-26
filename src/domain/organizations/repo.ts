import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "./schema";
import type { Organization, OrganizationWithSpots } from "./types";

async function generateUniqueOrgSlug(baseName: string): Promise<string> {
  let candidate = slugify(baseName) || "escola";
  let n = 0;
  for (;;) {
    const existing = await prisma.organizations.findFirst({
      where: { slug: candidate, deleted_at: null },
    });
    if (!existing) return candidate;
    n += 1;
    candidate = `${slugify(baseName) || "escola"}-${n}`;
  }
}

function mapOrganization(row: {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  site: string | null;
  instagram: string | null;
  avatar: string | null;
  hero_image: string | null;
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

export type PublicOrganizationRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  spotCount: number;
};

/** Diretório público de centros (organizações) com pelo menos um spot ativo. */
export async function listPublicOrganizations(): Promise<PublicOrganizationRow[]> {
  const rows = await prisma.organizations.findMany({
    where: {
      deleted_at: null,
      spots: { some: { deleted_at: null } },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatar: true,
      _count: {
        select: {
          spots: { where: { deleted_at: null } },
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    avatar: r.avatar,
    spotCount: r._count.spots,
  }));
}

export async function getById(id: number): Promise<Organization | null> {
  const row = await prisma.organizations.findFirst({
    where: { id, deleted_at: null },
  });
  return row ? mapOrganization(row) : null;
}

export async function getBySlug(slug: string): Promise<Organization | null> {
  const row = await prisma.organizations.findFirst({
    where: { slug, deleted_at: null },
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
  const slug =
    data.slug && data.slug.trim().length > 0
      ? slugify(data.slug)
      : await generateUniqueOrgSlug(data.name);
  return prisma.organizations.create({
    data: {
      name: data.name,
      slug,
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
      ...(data.hero_image !== undefined && { hero_image: data.hero_image }),
      ...(data.slug !== undefined && data.slug !== null && data.slug !== ""
        ? { slug: slugify(data.slug) }
        : {}),
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
