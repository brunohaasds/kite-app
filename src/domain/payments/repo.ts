import { prisma } from "@/lib/db";
import type { CreatePaymentInput, MarkPaidInput } from "./schema";
import type { PaymentItem } from "./types";

const paymentInclude = {
  student: {
    select: {
      id: true,
      user: { select: { id: true, name: true, phone: true } },
    },
  },
} as const;

function mapPaymentRow(row: {
  id: number;
  uuid: string;
  organization_id: number;
  student_id: number;
  student_package_id: number | null;
  amount: unknown;
  method: string | null;
  status: string;
  installment_number: number | null;
  total_installments: number | null;
  due_date: Date | null;
  paid_at: Date | null;
  student?: {
    id: number;
    user: { id: number; name: string; phone: string | null };
  };
}): PaymentItem {
  return {
    id: row.id,
    uuid: row.uuid,
    organization_id: row.organization_id,
    student_id: row.student_id,
    student_package_id: row.student_package_id,
    amount: Number(row.amount as number),
    method: row.method,
    status: row.status,
    installment_number: row.installment_number,
    total_installments: row.total_installments,
    due_date: row.due_date,
    paid_at: row.paid_at,
    student: row.student,
  };
}

export async function listByOrg(organizationId: number): Promise<PaymentItem[]> {
  const rows = await prisma.payments.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: paymentInclude,
  });
  return rows.map(mapPaymentRow);
}

export async function listByStudent(studentId: number): Promise<PaymentItem[]> {
  const rows = await prisma.payments.findMany({
    where: { student_id: studentId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: paymentInclude,
  });
  return rows.map(mapPaymentRow);
}

export async function create(organizationId: number, data: CreatePaymentInput) {
  const row = await prisma.payments.create({
    data: {
      organization_id: organizationId,
      student_id: data.student_id,
      student_package_id: data.student_package_id ?? undefined,
      amount: data.amount,
      method: data.method ?? undefined,
      status: "pending",
      installment_number: data.installment_number ?? undefined,
      total_installments: data.total_installments ?? undefined,
      due_date: data.due_date ?? undefined,
    },
    include: paymentInclude,
  });
  return mapPaymentRow(row);
}

export async function markAsPaid(paymentId: number, data: MarkPaidInput) {
  const existing = await prisma.payments.findFirst({
    where: { id: paymentId, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Pagamento não encontrado");
  }

  const row = await prisma.payments.update({
    where: { id: paymentId },
    data: {
      status: "paid",
      method: data.method,
      paid_at: new Date(),
    },
    include: paymentInclude,
  });
  return mapPaymentRow(row);
}

export async function generateInstallments(
  studentPackageId: number,
  amount: number,
  installments: number
) {
  if (installments < 1) {
    throw new Error("installments deve ser >= 1");
  }

  const sp = await prisma.student_packages.findFirst({
    where: { id: studentPackageId, deleted_at: null },
    include: { student: true },
  });
  if (!sp) {
    throw new Error("Pacote do aluno não encontrado");
  }

  const orgId = sp.student.organization_id;
  const studentId = sp.student_id;
  const each = amount / installments;
  const base = new Date();

  const creates = Array.from({ length: installments }, (_, i) =>
    prisma.payments.create({
      data: {
        organization_id: orgId,
        student_id: studentId,
        student_package_id: studentPackageId,
        amount: each,
        status: "pending",
        installment_number: i + 1,
        total_installments: installments,
        due_date: (() => {
          const due = new Date(base);
          due.setMonth(due.getMonth() + i + 1);
          return due;
        })(),
      },
      include: paymentInclude,
    })
  );

  const rows = await prisma.$transaction(creates);
  return rows.map(mapPaymentRow);
}
