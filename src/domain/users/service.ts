import { Prisma } from "@/generated/prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { CreateUserInput } from "./schema";

export type RegisterStudentExtras = {
  level?: string | null;
  goals?: unknown;
  notes?: string | null;
};

export async function registerStudent(
  orgId: number,
  data: Omit<CreateUserInput, "role"> & RegisterStudentExtras
) {
  const { level, goals, notes, ...userFields } = data;
  const hashedPassword = await hash(userFields.password, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name: userFields.name,
        email: userFields.email,
        phone: userFields.phone,
        password: hashedPassword,
        role: "student",
      },
    });

    await tx.members.create({
      data: {
        organization_id: orgId,
        user_id: user.id,
      },
    });

    await tx.students.create({
      data: {
        organization_id: orgId,
        user_id: user.id,
        level: level ?? null,
        goals:
          goals === undefined
            ? undefined
            : goals === null
              ? Prisma.JsonNull
              : (goals as Prisma.InputJsonValue),
        notes: notes ?? null,
      },
    });

    return user;
  });
}

export async function assignToOrganization(userId: number, orgId: number) {
  const existing = await prisma.members.findFirst({
    where: {
      organization_id: orgId,
      user_id: userId,
    },
  });

  if (existing) {
    if (existing.deleted_at) {
      return prisma.members.update({
        where: { id: existing.id },
        data: { deleted_at: null },
      });
    }
    return existing;
  }

  return prisma.members.create({
    data: {
      organization_id: orgId,
      user_id: userId,
    },
  });
}
