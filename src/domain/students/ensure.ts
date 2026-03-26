import type { Prisma, students } from "@/generated/prisma/client";

export class StudentOrgConflictError extends Error {
  constructor() {
    super("student_org_conflict");
    this.name = "StudentOrgConflictError";
  }
}

/**
 * Garante member + students para o utilizador na organização do agendamento.
 * Um utilizador só pode ter um registo `students` (user_id único); se já existir noutra org, falha.
 */
export async function ensureStudentForOrganization(
  tx: Prisma.TransactionClient,
  userId: number,
  organizationId: number,
): Promise<students> {
  const existing = await tx.students.findFirst({
    where: { user_id: userId, deleted_at: null },
  });

  if (existing) {
    if (existing.organization_id !== organizationId) {
      throw new StudentOrgConflictError();
    }
    return existing;
  }

  await tx.members.create({
    data: {
      organization_id: organizationId,
      user_id: userId,
    },
  });

  return tx.students.create({
    data: {
      organization_id: organizationId,
      user_id: userId,
      level: null,
    },
  });
}
