import { requireAuth } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { InstrutorAgendaClient } from "./instrutor-agenda-client";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function InstrutorAgendaPage({ searchParams }: Props) {
  const session = await requireAuth();
  const userId = Number(session.user.id);
  const params = await searchParams;

  const instructor = await prisma.instructors.findFirst({
    where: { user_id: userId, deleted_at: null },
  });

  if (!instructor) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Perfil de instrutor não encontrado.
      </div>
    );
  }

  const selectedDate = params.date
    ? new Date(params.date + "T12:00:00")
    : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const sessions = await prisma.sessions.findMany({
    where: {
      instructor_id: instructor.id,
      date: { gte: selectedDate, lt: nextDay },
      deleted_at: null,
    },
    include: {
      student: { include: { user: { select: { name: true, phone: true } } } },
      spot: { select: { name: true } },
    },
    orderBy: { start_time: "asc" },
  });

  const serialized = sessions.map((s) => ({
    uuid: s.uuid,
    date: s.date.toISOString(),
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status,
    type: s.type,
    studentName: s.student?.user.name ?? "—",
    studentPhone: s.student?.user.phone ?? "",
    spotName: s.spot?.name ?? "—",
  }));

  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <InstrutorAgendaClient
      sessions={serialized}
      currentDate={dateStr}
    />
  );
}
