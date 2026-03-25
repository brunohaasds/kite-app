import { requireAuth } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { ContaClient } from "./conta-client";

export default async function StudentAccountPage() {
  const session = await requireAuth();
  const userId = Number(session.user.id);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  });

  if (!user) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Usuário não encontrado.
      </div>
    );
  }

  const student = await prisma.students.findFirst({
    where: { user_id: userId, deleted_at: null },
    select: { id: true, level: true },
  });

  const totalSessions = student
    ? await prisma.sessions.count({
        where: { student_id: student.id, status: "completed", deleted_at: null },
      })
    : 0;

  const activePkgs = student
    ? await prisma.student_packages.count({
        where: { student_id: student.id, status: "active", deleted_at: null },
      })
    : 0;

  return (
    <ContaClient
      user={{ id: user.id, name: user.name, email: user.email, phone: user.phone }}
      level={student?.level ?? null}
      totalSessions={totalSessions}
      activePackages={activePkgs}
    />
  );
}
