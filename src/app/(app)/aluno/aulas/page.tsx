import { requireAuth } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { StudentRecoveryPanel } from "@/components/student/student-recovery-panel";
import { AulasClient } from "./aulas-client";

export default async function StudentLessonsPage() {
  const session = await requireAuth();
  const userId = Number(session.user.id);

  const student = await prisma.students.findFirst({
    where: { user_id: userId, deleted_at: null },
  });

  if (!student) {
    return <StudentRecoveryPanel variant="no_student" />;
  }

  const sessions = await prisma.sessions.findMany({
    where: { student_id: student.id, deleted_at: null },
    include: {
      spot: { select: { id: true, name: true } },
      instructor: { include: { user: { select: { name: true, phone: true } } } },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const upcoming = sessions
    .filter((s) => s.date >= now && !["cancelled", "cancelled_weather", "cancelled_student"].includes(s.status))
    .map(mapSession);
  const past = sessions
    .filter((s) => s.date < now || s.status === "completed")
    .map(mapSession);
  const cancelled = sessions
    .filter((s) => ["cancelled", "cancelled_weather", "cancelled_student"].includes(s.status))
    .map(mapSession);

  return <AulasClient upcoming={upcoming} past={past} cancelled={cancelled} />;
}

function mapSession(s: {
  id: number;
  uuid: string;
  date: Date;
  start_time: string;
  end_time: string | null;
  status: string;
  type: string | null;
  spot: { id: number; name: string } | null;
  instructor: { user: { name: string; phone: string | null } } | null;
}) {
  return {
    id: s.id,
    uuid: s.uuid,
    date: s.date.toISOString(),
    start_time: s.start_time,
    end_time: s.end_time,
    status: s.status,
    type: s.type,
    spotName: s.spot?.name ?? null,
    instructorName: s.instructor?.user.name ?? null,
    instructorPhone: s.instructor?.user.phone ?? null,
  };
}
