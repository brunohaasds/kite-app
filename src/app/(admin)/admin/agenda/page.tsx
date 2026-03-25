import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = await prisma.sessions.findMany({
    where: {
      organization_id: orgId,
      date: { gte: today, lt: tomorrow },
      deleted_at: null,
    },
    include: {
      student: { include: { user: { select: { name: true, phone: true } } } },
      instructor: { include: { user: { select: { name: true } } } },
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
    notes: s.notes,
    studentName: s.student?.user.name ?? "—",
    studentPhone: s.student?.user.phone ?? "",
    instructorName: s.instructor?.user.name ?? "—",
    spotName: s.spot?.name ?? "—",
  }));

  return <AgendaClient sessions={serialized} />;
}
