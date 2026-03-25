import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { listByOrg as listPackages } from "@/domain/packages/repo";
import { getById as getOrg } from "@/domain/organizations/repo";
import { BookingWizard } from "./booking-wizard";

interface Props {
  params: Promise<{ id: string; slotId: string }>;
}

export default async function BookingPage({ params }: Props) {
  const { id, slotId } = await params;
  const orgId = Number(id);
  const slotIdNum = Number(slotId);

  if (isNaN(orgId) || isNaN(slotIdNum)) notFound();

  const [slot, org, packages] = await Promise.all([
    prisma.agenda_slots.findUnique({
      where: { id: slotIdNum },
      include: {
        agenda: { select: { date: true, day_name: true } },
        spot: { select: { id: true, name: true } },
        instructor: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    }),
    getOrg(orgId),
    listPackages(orgId),
  ]);

  if (!slot || !org) notFound();
  if (slot.booked) notFound();

  const activePackages = packages.filter((p) => p.active);

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

  const packagesData = activePackages.map((p) => ({
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
