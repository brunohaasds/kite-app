import { Prisma } from "@/generated/prisma/client";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { CreateUserInput } from "./schema";
import type {
  SuperAdminCreateUserInput,
  SuperAdminUpdateUserInput,
} from "./schema";

const MINIMAL_STUDENT_PLACEHOLDER_NAME = "Aluno";

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

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

/** Utilizador `student` sem `members`/`students` até o primeiro agendamento numa escola. */
export async function registerStudentMinimal(data: { email: string; password: string }) {
  const hashedPassword = await hash(data.password, 12);
  return prisma.users.create({
    data: {
      name: MINIMAL_STUDENT_PLACEHOLDER_NAME,
      email: data.email,
      phone: null,
      password: hashedPassword,
      role: "student",
    },
  });
}

export function isPlaceholderStudentName(name: string) {
  return name.trim().toLowerCase() === MINIMAL_STUDENT_PLACEHOLDER_NAME.toLowerCase();
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

async function assertEmailAvailable(email: string, excludeUserId?: number) {
  const row = await prisma.users.findFirst({
    where: {
      email,
      deleted_at: null,
      ...(excludeUserId !== undefined ? { id: { not: excludeUserId } } : {}),
    },
  });
  if (row) {
    throw new Error("Este email já está em uso");
  }
}

async function upsertMemberForOrg(
  tx: Prisma.TransactionClient,
  userId: number,
  organizationId: number,
) {
  const row = await tx.members.findFirst({
    where: { organization_id: organizationId, user_id: userId },
  });
  if (row) {
    await tx.members.update({
      where: { id: row.id },
      data: { deleted_at: null },
    });
    return;
  }
  await tx.members.create({
    data: { organization_id: organizationId, user_id: userId },
  });
}

async function attachUserToOrganizationRole(
  tx: Prisma.TransactionClient,
  userId: number,
  organizationId: number,
  role: "admin" | "student" | "instructor",
) {
  await tx.members.updateMany({
    where: { user_id: userId, deleted_at: null },
    data: { deleted_at: new Date() },
  });

  await upsertMemberForOrg(tx, userId, organizationId);

  if (role === "admin") {
    await tx.students.updateMany({
      where: { user_id: userId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
    await tx.instructors.updateMany({
      where: { user_id: userId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
    return;
  }

  if (role === "student") {
    await tx.instructors.updateMany({
      where: { user_id: userId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
    const existing = await tx.students.findFirst({
      where: { user_id: userId },
    });
    if (existing) {
      await tx.students.update({
        where: { id: existing.id },
        data: {
          organization_id: organizationId,
          deleted_at: null,
        },
      });
    } else {
      await tx.students.create({
        data: { organization_id: organizationId, user_id: userId },
      });
    }
    return;
  }

  // instructor
  await tx.students.updateMany({
    where: { user_id: userId, deleted_at: null },
    data: { deleted_at: new Date() },
  });
  const existingInst = await tx.instructors.findFirst({
    where: { user_id: userId },
  });
  if (existingInst) {
    await tx.instructors.update({
      where: { id: existingInst.id },
      data: {
        organization_id: organizationId,
        deleted_at: null,
      },
    });
  } else {
    await tx.instructors.create({
      data: { organization_id: organizationId, user_id: userId },
    });
  }
}

async function detachOrgRoles(tx: Prisma.TransactionClient, userId: number) {
  await tx.members.updateMany({
    where: { user_id: userId, deleted_at: null },
    data: { deleted_at: new Date() },
  });
  await tx.students.updateMany({
    where: { user_id: userId, deleted_at: null },
    data: { deleted_at: new Date() },
  });
  await tx.instructors.updateMany({
    where: { user_id: userId, deleted_at: null },
    data: { deleted_at: new Date() },
  });
}

export async function createUserBySuperAdmin(input: SuperAdminCreateUserInput) {
  await assertEmailAvailable(input.email);

  const hashedPassword = await hash(input.password, 12);
  const phone =
    input.phone === "" || input.phone === undefined ? null : input.phone;

  if (input.role === "superadmin" || input.role === "service_provider") {
    return prisma.users.create({
      data: {
        name: input.name,
        email: input.email,
        phone,
        password: hashedPassword,
        role: input.role,
      },
    });
  }

  const orgId = input.organizationId!;
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.users.create({
      data: {
        name: input.name,
        email: input.email,
        phone,
        password: hashedPassword,
        role: input.role,
      },
    });
    await attachUserToOrganizationRole(
      tx,
      user.id,
      orgId,
      input.role as "admin" | "student" | "instructor",
    );
    return user;
  });
}

export async function updateUserBySuperAdmin(
  targetUserId: number,
  actorUserId: number,
  input: SuperAdminUpdateUserInput,
) {
  if (targetUserId === actorUserId) {
    throw new Error(
      "Use a página de conta para editar seu próprio perfil.",
    );
  }

  const target = await prisma.users.findFirst({
    where: { id: targetUserId, deleted_at: null },
  });
  if (!target) {
    throw new Error("Usuário não encontrado");
  }

  if (input.email !== undefined && input.email !== target.email) {
    await assertEmailAvailable(input.email, targetUserId);
  }

  const passwordHash =
    input.password !== undefined && input.password.length > 0
      ? await hash(input.password, 12)
      : undefined;

  const nextRole = input.role ?? target.role;
  const roleChanging =
    input.role !== undefined && input.role !== target.role;

  if (roleChanging) {
    if (target.role === "superadmin" && input.role !== "superadmin") {
      const superCount = await prisma.users.count({
        where: { role: "superadmin", deleted_at: null },
      });
      if (superCount <= 1) {
        throw new Error("Não é possível remover o último super admin");
      }
    }

    if (nextRole === "superadmin" || nextRole === "service_provider") {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await detachOrgRoles(tx, targetUserId);
        await tx.users.update({
          where: { id: targetUserId },
          data: {
            role: nextRole,
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
            ...(input.phone !== undefined && {
              phone: input.phone === "" ? null : input.phone,
            }),
            ...(passwordHash && { password: passwordHash }),
          },
        });
      });
      return;
    }

    const orgId =
      input.organizationId ??
      (
        await prisma.members.findFirst({
          where: { user_id: targetUserId, deleted_at: null },
          select: { organization_id: true },
        })
      )?.organization_id;
    if (!orgId) {
      throw new Error("Selecione uma escola para este perfil");
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.users.update({
        where: { id: targetUserId },
        data: {
          role: nextRole,
          ...(input.name !== undefined && { name: input.name }),
          ...(input.email !== undefined && { email: input.email }),
          ...(input.phone !== undefined && {
            phone: input.phone === "" ? null : input.phone,
          }),
          ...(passwordHash && { password: passwordHash }),
        },
      });
      await attachUserToOrganizationRole(
        tx,
        targetUserId,
        orgId,
        nextRole as "admin" | "student" | "instructor",
      );
    });
    return;
  }

  await prisma.users.update({
    where: { id: targetUserId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && {
        phone: input.phone === "" ? null : input.phone,
      }),
      ...(passwordHash && { password: passwordHash }),
    },
  });

  if (
    input.organizationId !== undefined &&
    (target.role === "admin" ||
      target.role === "student" ||
      target.role === "instructor")
  ) {
    const orgId = input.organizationId;
    if (!orgId) {
      throw new Error("Escola inválida");
    }
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await attachUserToOrganizationRole(
        tx,
        targetUserId,
        orgId,
        target.role as "admin" | "student" | "instructor",
      );
    });
  }
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; code: "user_not_found" | "wrong_password" };

/** Utilizador autenticado altera a própria senha (validar `currentPassword` antes de gravar). */
export async function changePasswordForAuthenticatedUser(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.users.findFirst({
    where: { id: userId, deleted_at: null },
    select: { password: true },
  });
  if (!user) {
    return { ok: false, code: "user_not_found" };
  }
  const match = await compare(currentPassword, user.password);
  if (!match) {
    return { ok: false, code: "wrong_password" };
  }
  const hashed = await hash(newPassword, 12);
  await prisma.users.update({
    where: { id: userId },
    data: { password: hashed },
  });
  return { ok: true };
}
