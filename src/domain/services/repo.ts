import { prisma } from "@/lib/db";

export async function findServiceByUserId(userId: number) {
  return prisma.services.findFirst({
    where: { user_id: userId, deleted_at: null },
  });
}

export async function listForOrganization(organizationId: number) {
  return prisma.services.findMany({
    where: {
      deleted_at: null,
      is_active: true,
      scopes: {
        some: {
          organization_id: organizationId,
        },
      },
    },
    include: {
      user: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { display_name: "asc" },
  });
}

export async function listForGlobalSpot(globalSpotId: number) {
  return prisma.services.findMany({
    where: {
      deleted_at: null,
      is_active: true,
      scopes: {
        some: {
          global_spot_id: globalSpotId,
        },
      },
    },
    include: {
      user: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { display_name: "asc" },
  });
}

export async function listBookingsForService(serviceId: number) {
  return prisma.service_bookings.findMany({
    where: { service_id: serviceId, deleted_at: null },
    include: {
      student: {
        include: { user: { select: { name: true, email: true, phone: true } } },
      },
      session: {
        include: {
          organization: { select: { id: true, name: true } },
          spot: { select: { name: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}
