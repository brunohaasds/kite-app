import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listForOrganization } from "@/domain/services/repo";
import type { Organization } from "@/domain/organizations/types";

export type SchoolLandingPayload = {
  org: Organization;
  spots: { id: number; name: string }[];
  instructors: Array<{
    id: number;
    user: { name: string };
    certification: string | null;
    experience_years: number | null;
    avatar: string | null;
  }>;
  partners: Awaited<ReturnType<typeof listForOrganization>>;
  canRequestPartner: boolean;
  upcomingSlots: Array<{
    day: string;
    date: string;
    time: string;
    instructor: string;
    slotId: number;
  }>;
};

export async function loadSchoolLandingData(org: Organization): Promise<SchoolLandingPayload> {
  const orgId = org.id;

  const spots = await prisma.spots.findMany({
    where: { organization_id: orgId, deleted_at: null },
  });

  const instructors = await prisma.instructors.findMany({
    where: { organization_id: orgId, deleted_at: null },
    select: {
      id: true,
      certification: true,
      experience_years: true,
      avatar: true,
      user: { select: { name: true } },
    },
  });

  const partners = await listForOrganization(orgId);
  const session = await auth();
  const canRequestPartner = session?.user?.role === "student";

  const agendas = await prisma.agendas.findMany({
    where: { organization_id: orgId, published: true, deleted_at: null },
    include: {
      slots: {
        where: { booked: false, deleted_at: null },
        include: { instructor: { include: { user: { select: { name: true } } } } },
        take: 4,
        orderBy: { time: "asc" },
      },
    },
    orderBy: { date: "asc" },
    take: 2,
  });

  const upcomingSlots = agendas.flatMap((a: (typeof agendas)[number]) =>
    a.slots.map((s: (typeof a.slots)[number]) => ({
      day: a.day_name.slice(0, 3),
      date: a.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      time: s.time,
      instructor: s.instructor?.user.name ?? "A definir",
      slotId: s.id,
    })),
  );

  return {
    org,
    spots,
    instructors,
    partners,
    canRequestPartner,
    upcomingSlots,
  };
}
