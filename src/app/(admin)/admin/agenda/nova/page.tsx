import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { NovaAgendaClient } from "./nova-agenda-client";

export default async function NovaAgendaPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const [instructors, spots, agendas] = await Promise.all([
    prisma.instructors.findMany({
      where: { organization_id: orgId, deleted_at: null },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.spots.findMany({
      where: { organization_id: orgId, deleted_at: null },
      orderBy: { name: "asc" },
    }),
    prisma.agendas.findMany({
      where: { organization_id: orgId, deleted_at: null, published: true },
      include: { _count: { select: { slots: true } } },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const serializedInstructors = instructors.map((i) => ({
    id: i.id,
    uuid: i.uuid,
    name: i.user.name,
  }));

  const serializedSpots = spots.map((s) => ({
    id: s.id,
    uuid: s.uuid,
    name: s.name,
  }));

  const serializedAgendas = agendas.map((a) => ({
    uuid: a.uuid,
    date: a.date.toISOString(),
    dayName: a.day_name,
    published: a.published,
    slotCount: a._count.slots,
  }));

  return (
    <NovaAgendaClient
      organizationId={orgId}
      instructors={serializedInstructors}
      spots={serializedSpots}
      existingAgendas={serializedAgendas}
    />
  );
}
