import { requireAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import { FinanceiroClient } from "./financeiro-client";

export default async function FinanceiroPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const payments = await prisma.payments.findMany({
    where: { organization_id: orgId, deleted_at: null },
    include: {
      student: { include: { user: { select: { name: true, phone: true } } } },
    },
    orderBy: { created_at: "desc" },
  });

  let totalReceived = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  const serialized = payments.map((p) => {
    const amount = Number(p.amount);

    if (p.status === "paid") totalReceived += amount;
    else if (p.status === "overdue") totalOverdue += amount;
    else if (p.status === "pending") totalPending += amount;

    return {
      uuid: p.uuid,
      studentName: p.student.user.name,
      studentPhone: p.student.user.phone ?? "",
      amount,
      method: p.method,
      status: p.status,
      installmentNumber: p.installment_number,
      totalInstallments: p.total_installments,
      dueDate: p.due_date?.toISOString() ?? null,
      paidAt: p.paid_at?.toISOString() ?? null,
    };
  });

  return (
    <FinanceiroClient
      payments={serialized}
      summary={{ totalReceived, totalPending, totalOverdue }}
    />
  );
}
