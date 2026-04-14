import { requireAuth } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { StudentRecoveryPanel } from "@/components/student/student-recovery-panel";
import { PacotesClient } from "./pacotes-client";

export default async function StudentPackagesPage() {
  const session = await requireAuth();
  const userId = Number(session.user.id);

  const student = await prisma.students.findFirst({
    where: { user_id: userId, deleted_at: null },
  });

  if (!student) {
    return <StudentRecoveryPanel variant="no_student" />;
  }

  const studentPackages = await prisma.student_packages.findMany({
    where: { student_id: student.id, deleted_at: null },
    include: { package: true },
    orderBy: { created_at: "desc" },
  });

  const availablePackages = await prisma.packages.findMany({
    where: {
      organization_id: student.organization_id,
      active: true,
      deleted_at: null,
    },
    orderBy: { price: "asc" },
  });

  const myPkgs = studentPackages.map((sp) => ({
    id: sp.id,
    title: sp.package.title,
    sessionsUsed: sp.sessions_used,
    sessionsTotal: sp.sessions_total,
    sessionsRemaining: sp.sessions_remaining,
    status: sp.status,
    expiryDate: sp.expiry_date?.toISOString() ?? null,
    pricePerSession: Number(sp.package.price) / sp.package.session_count,
  }));

  const available = availablePackages.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    sessionCount: p.session_count,
    price: Number(p.price),
    pricePerSession: Number(p.price) / p.session_count,
    validityDays: p.validity_days,
  }));

  return (
    <PacotesClient
      myPackages={myPkgs}
      availablePackages={available}
      studentId={student.id}
    />
  );
}
