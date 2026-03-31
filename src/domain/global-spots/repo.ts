import { prisma } from "@/lib/db";
import type { CreateGlobalSpotInput, UpdateGlobalSpotInput } from "./schema";

export async function listAll() {
  return prisma.global_spots.findMany({
    where: { deleted_at: null },
    include: {
      parent_spot: { select: { id: true, name: true, slug: true } },
      owner_organization: { select: { id: true, name: true } },
      _count: { select: { spots: true, permissions: true } },
    },
    orderBy: [{ parent_spot_id: "asc" }, { name: "asc" }],
  });
}

export async function findById(id: number) {
  return prisma.global_spots.findFirst({
    where: { id, deleted_at: null },
    include: {
      parent_spot: { select: { id: true, name: true, slug: true } },
      owner_organization: { select: { id: true, name: true } },
      children: { where: { deleted_at: null }, orderBy: { name: "asc" } },
      permissions: {
        where: { status: "approved" },
        include: {
          organization: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });
}

export async function findBySlug(slug: string) {
  return prisma.global_spots.findFirst({
    where: { slug, deleted_at: null },
    include: {
      parent_spot: { select: { id: true, name: true, slug: true } },
      owner_organization: {
        select: { id: true, name: true, avatar: true, slug: true },
      },
      children: {
        where: { deleted_at: null },
        include: {
          owner_organization: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
      },
      spots: {
        where: { deleted_at: null },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              avatar: true,
              description: true,
              slug: true,
            },
          },
        },
      },
      permissions: {
        where: { status: "approved" },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              avatar: true,
              description: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export async function listPublicDirectory(filters: {
  country?: string;
  state?: string;
  q?: string;
}) {
  const q = filters.q?.trim();
  return prisma.global_spots.findMany({
    where: {
      deleted_at: null,
      parent_spot_id: null,
      ...(filters.country && { country: filters.country }),
      ...(filters.state && { state: filters.state }),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      country: true,
      state: true,
      access: true,
    },
  });
}

export async function findByOwnerId(organizationId: number) {
  return prisma.global_spots.findFirst({
    where: {
      owner_organization_id: organizationId,
      deleted_at: null,
    },
    include: {
      parent_spot: { select: { id: true, name: true, slug: true } },
      permissions: {
        where: { status: "approved" },
        include: {
          organization: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });
}

export async function create(data: CreateGlobalSpotInput) {
  return prisma.global_spots.create({
    data: {
      name: data.name,
      slug: data.slug,
      access: data.access,
      country: data.country ?? null,
      state: data.state ?? null,
      description: data.description ?? null,
      image: data.image ?? null,
      tips: data.tips ?? undefined,
      services: data.services ?? undefined,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      parent_spot_id: data.parent_spot_id ?? null,
      owner_organization_id: data.owner_organization_id ?? null,
    },
  });
}

export async function update(id: number, data: Omit<UpdateGlobalSpotInput, "id">) {
  return prisma.global_spots.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.access !== undefined && { access: data.access }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.tips !== undefined && { tips: data.tips ?? undefined }),
      ...(data.services !== undefined && { services: data.services ?? undefined }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.parent_spot_id !== undefined && { parent_spot_id: data.parent_spot_id }),
      ...(data.owner_organization_id !== undefined && { owner_organization_id: data.owner_organization_id }),
    },
  });
}

export async function remove(id: number) {
  return prisma.global_spots.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export async function listAvailableForOrg(organizationId: number) {
  return prisma.global_spots.findMany({
    where: {
      deleted_at: null,
      OR: [
        { access: "public" },
        { owner_organization_id: organizationId },
        {
          access: "private",
          permissions: {
            some: { organization_id: organizationId, status: "approved" },
          },
        },
      ],
    },
    include: {
      parent_spot: { select: { id: true, name: true, slug: true } },
      owner_organization: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function grantAccess(
  globalSpotId: number,
  organizationId: number,
  grantedById: number,
) {
  return prisma.spot_permissions.upsert({
    where: {
      global_spot_id_organization_id: {
        global_spot_id: globalSpotId,
        organization_id: organizationId,
      },
    },
    update: { status: "approved", granted_by_id: grantedById },
    create: {
      global_spot_id: globalSpotId,
      organization_id: organizationId,
      status: "approved",
      granted_by_id: grantedById,
    },
  });
}

export async function revokeAccess(
  globalSpotId: number,
  organizationId: number,
) {
  return prisma.spot_permissions.updateMany({
    where: {
      global_spot_id: globalSpotId,
      organization_id: organizationId,
    },
    data: { status: "revoked" },
  });
}

export async function linkSpot(
  globalSpotId: number,
  organizationId: number,
  name: string,
) {
  return prisma.spots.create({
    data: {
      global_spot_id: globalSpotId,
      organization_id: organizationId,
      name,
    },
  });
}

export async function unlinkSpot(spotId: number) {
  return prisma.spots.update({
    where: { id: spotId },
    data: { deleted_at: new Date() },
  });
}

export async function getLinkedSpots(organizationId: number) {
  return prisma.spots.findMany({
    where: {
      organization_id: organizationId,
      global_spot_id: { not: null },
      deleted_at: null,
    },
    select: {
      id: true,
      global_spot_id: true,
      name: true,
    },
  });
}

/** Spot público com coordenadas para o mapa + escolas ligadas via spots. */
export type PublicMapSpotMarker = {
  id: number;
  name: string;
  slug: string;
  country: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  schools: { id: number; name: string; slug: string }[];
};

export async function listPublicMapMarkers(filters: {
  country?: string;
  state?: string;
  q?: string;
}): Promise<PublicMapSpotMarker[]> {
  const q = filters.q?.trim();
  const rows = await prisma.global_spots.findMany({
    where: {
      deleted_at: null,
      parent_spot_id: null,
      latitude: { not: null },
      longitude: { not: null },
      ...(filters.country && { country: filters.country }),
      ...(filters.state && { state: filters.state }),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      state: true,
      latitude: true,
      longitude: true,
      spots: {
        where: { deleted_at: null },
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              deleted_at: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => {
    const schoolMap = new Map<
      number,
      { id: number; name: string; slug: string }
    >();
    for (const s of row.spots) {
      const o = s.organization;
      if (o.deleted_at == null) {
        schoolMap.set(o.id, { id: o.id, name: o.name, slug: o.slug });
      }
    }
    const lat = row.latitude != null ? Number(row.latitude) : 0;
    const lng = row.longitude != null ? Number(row.longitude) : 0;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      country: row.country,
      state: row.state,
      latitude: lat,
      longitude: lng,
      schools: [...schoolMap.values()],
    };
  });
}

export async function listPublicMapFilterOptions(): Promise<{
  countries: string[];
  states: string[];
}> {
  const rows = await prisma.global_spots.findMany({
    where: {
      deleted_at: null,
      parent_spot_id: null,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { country: true, state: true },
  });
  const countries = [
    ...new Set(
      rows.map((r) => r.country).filter((c): c is string => Boolean(c)),
    ),
  ];
  const states = [
    ...new Set(rows.map((r) => r.state).filter((s): s is string => Boolean(s))),
  ];
  countries.sort();
  states.sort();
  return { countries, states };
}

/** KPIs por UF para o mapa público (spots com coords + escolas distintas ligadas via `spots`). */
export type PublicMapStateKpi = {
  state: string;
  country: string | null;
  spotCount: number;
  schoolCount: number;
};

export async function listPublicMapStateKpis(): Promise<PublicMapStateKpi[]> {
  const rows = await prisma.global_spots.findMany({
    where: {
      deleted_at: null,
      parent_spot_id: null,
      latitude: { not: null },
      longitude: { not: null },
      state: { not: null },
    },
    select: {
      id: true,
      state: true,
      country: true,
      spots: {
        where: { deleted_at: null },
        select: {
          organization: {
            select: { id: true, deleted_at: true },
          },
        },
      },
    },
  });

  const byKey = new Map<
    string,
    { state: string; country: string | null; spotIds: Set<number>; orgIds: Set<number> }
  >();

  for (const gs of rows) {
    const state = gs.state as string;
    const key = `${gs.country ?? ""}\0${state}`;
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = {
        state,
        country: gs.country,
        spotIds: new Set(),
        orgIds: new Set(),
      };
      byKey.set(key, bucket);
    }
    bucket.spotIds.add(gs.id);
    for (const s of gs.spots) {
      const o = s.organization;
      if (o.deleted_at == null) {
        bucket.orgIds.add(o.id);
      }
    }
  }

  const kpis: PublicMapStateKpi[] = [...byKey.values()].map((b) => ({
    state: b.state,
    country: b.country,
    spotCount: b.spotIds.size,
    schoolCount: b.orgIds.size,
  }));

  kpis.sort((a, b) =>
    b.spotCount !== a.spotCount
      ? b.spotCount - a.spotCount
      : a.state.localeCompare(b.state, "pt-BR"),
  );

  return kpis;
}
