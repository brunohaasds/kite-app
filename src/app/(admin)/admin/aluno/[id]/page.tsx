import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { AlunoDetailClient } from "./aluno-detail-client";

export default async function AlunoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;
  const { id: uuid } = await params;

  const student = await prisma.students.findFirst({
    where: { uuid, organization_id: orgId, deleted_at: null },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!student) notFound();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [sessions, studentPackages, payments] = await Promise.all([
    prisma.sessions.findMany({
      where: { student_id: student.id, deleted_at: null },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        spot: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.student_packages.findMany({
      where: { student_id: student.id, deleted_at: null },
      include: {
        package: { select: { title: true, session_count: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.payments.findMany({
      where: { student_id: student.id, deleted_at: null },
      orderBy: { due_date: "asc" },
    }),
  ]);

  const upcomingSessions = sessions
    .filter((s) => new Date(s.date) >= now && !["completed", "cancelled", "cancelled_weather", "cancelled_student"].includes(s.status))
    .map((s) => ({
      uuid: s.uuid,
      date: s.date.toISOString(),
      startTime: s.start_time,
      status: s.status,
      instructorName: s.instructor?.user.name ?? "—",
      spotName: s.spot?.name ?? "—",
    }));

  const pastSessions = sessions
    .filter(
      (s) =>
        new Date(s.date) < now ||
        ["completed", "cancelled", "cancelled_weather", "cancelled_student"].includes(s.status),
    )
    .map((s) => ({
      uuid: s.uuid,
      date: s.date.toISOString(),
      startTime: s.start_time,
      status: s.status,
      instructorName: s.instructor?.user.name ?? "—",
      spotName: s.spot?.name ?? "—",
    }));

  const serializedPackages = studentPackages.map((sp) => ({
    uuid: sp.uuid,
    packageTitle: sp.package.title,
    sessionsTotal: sp.sessions_total,
    sessionsUsed: sp.sessions_used,
    sessionsRemaining: sp.sessions_remaining,
    status: sp.status,
    purchaseDate: sp.purchase_date.toISOString(),
    expiryDate: sp.expiry_date?.toISOString() ?? null,
  }));

  const serializedPayments = payments.map((p) => ({
    uuid: p.uuid,
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    installmentNumber: p.installment_number,
    totalInstallments: p.total_installments,
    dueDate: p.due_date?.toISOString() ?? null,
    paidAt: p.paid_at?.toISOString() ?? null,
  }));

  return (
    <AlunoDetailClient
      student={{
        uuid: student.uuid,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone ?? "",
        level: student.level ?? "iniciante",
      }}
      upcomingSessions={upcomingSessions}
      pastSessions={pastSessions}
      packages={serializedPackages}
      payments={serializedPayments}
      totalSessions={sessions.length}
    />
  );
}
