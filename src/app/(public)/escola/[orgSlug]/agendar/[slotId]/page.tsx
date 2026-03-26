import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { listByOrg as listPackages } from "@/domain/packages/repo";
import { getOrganizationFromEscolaParam } from "@/lib/resolve-org";
import { BookingWizard } from "./booking-wizard";

interface Props {
  params: Promise<{ orgSlug: string; slotId: string }>;
}

export default async function BookingPage({ params }: Props) {
  const { orgSlug, slotId } = await params;
  const slotIdNum = Number(slotId);

  if (isNaN(slotIdNum)) notFound();

  const org = await getOrganizationFromEscolaParam(orgSlug);
  const orgId = org.id;

  const [slot, packages] = await Promise.all([
    prisma.agenda_slots.findUnique({
      where: { id: slotIdNum },
      include: {
        agenda: { select: { date: true, day_name: true, organization_id: true } },
        spot: { select: { id: true, name: true } },
        instructor: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    }),
    listPackages(orgId),
  ]);

  if (!slot) notFound();
  if (slot.booked) notFound();
  if (slot.agenda.organization_id !== orgId) notFound();

  const activePackages = packages.filter((p: (typeof packages)[number]) => p.active);

  const slotData = {
    id: slot.id,
    time: slot.time,
    date: slot.agenda.date.toISOString(),
    dayName: slot.agenda.day_name,
    spotName: slot.spot?.name ?? null,
    instructorName: slot.instructor?.user.name ?? null,
  };

  const orgData = {
    id: org.id,
    name: org.name,
    whatsapp: org.whatsapp,
  };

  const packagesData = activePackages.map((p: (typeof activePackages)[number]) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    sessionCount: p.session_count,
    price: p.price,
    pricePerLesson: Math.round((p.price / p.session_count) * 100) / 100,
    validityDays: p.validity_days,
  }));

  return (
    <BookingWizard
      slot={slotData}
      org={orgData}
      packages={packagesData}
    />
  );
}
