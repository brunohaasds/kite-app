import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { AgendaClient } from "./agenda-client";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function AgendaPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;
  const params = await searchParams;

  const selectedDate = params.date
    ? new Date(params.date + "T12:00:00")
    : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const [sessions, agendas, bookingStudents] = await Promise.all([
    prisma.sessions.findMany({
      where: {
        organization_id: orgId,
        date: { gte: selectedDate, lt: nextDay },
        deleted_at: null,
      },
      include: {
        student: { include: { user: { select: { name: true, phone: true } } } },
        instructor: { include: { user: { select: { name: true } } } },
        spot: { select: { name: true } },
      },
      orderBy: { start_time: "asc" },
    }),
    prisma.agendas.findMany({
      where: {
        organization_id: orgId,
        date: { gte: selectedDate, lt: nextDay },
        deleted_at: null,
      },
      include: {
        slots: {
          where: { deleted_at: null },
          include: {
            instructor: { include: { user: { select: { name: true } } } },
            spot: { select: { name: true } },
          },
          orderBy: { time: "asc" },
        },
      },
    }),
    prisma.students.findMany({
      where: { organization_id: orgId, deleted_at: null },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const serialized = sessions.map((s) => ({
    uuid: s.uuid,
    date: s.date.toISOString(),
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status,
    type: s.type,
    notes: s.notes,
    bookingSource: s.booking_source,
    studentName: s.student?.user.name ?? "—",
    studentPhone: s.student?.user.phone ?? "",
    instructorName: s.instructor?.user.name ?? "—",
    spotName: s.spot?.name ?? "—",
  }));

  const studentsForBooking = bookingStudents.map((st) => ({
    id: st.id,
    name: st.user.name,
    email: st.user.email,
  }));

  const availableSlots = agendas.flatMap((a) =>
    a.slots.map((s) => ({
      id: s.id,
      time: s.time,
      booked: s.booked,
      instructorName: s.instructor?.user.name ?? "A definir",
      spotName: s.spot?.name ?? null,
    })),
  );

  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <AgendaClient
      sessions={serialized}
      currentDate={dateStr}
      availableSlots={availableSlots}
      bookingStudents={studentsForBooking}
    />
  );
}
