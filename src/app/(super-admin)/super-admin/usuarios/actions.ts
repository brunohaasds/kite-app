"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  superAdminCreateUserSchema,
  superAdminUpdateUserSchema,
} from "@/domain/users/schema";
import {
  createUserBySuperAdmin,
  updateUserBySuperAdmin,
} from "@/domain/users/service";

export type SuperAdminUserActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function assertSuperAdmin(): Promise<SuperAdminUserActionResult | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return { ok: false, error: "Não autorizado" };
  }
  return null;
}

export async function createUserSuperAdminAction(
  input: unknown,
): Promise<SuperAdminUserActionResult> {
  const deny = await assertSuperAdmin();
  if (deny) return deny;

  const parsed = superAdminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await createUserBySuperAdmin(parsed.data);
    revalidatePath("/super-admin/usuarios");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao criar usuário",
    };
  }
}

export async function updateUserSuperAdminAction(
  userId: number,
  input: unknown,
): Promise<SuperAdminUserActionResult> {
  const deny = await assertSuperAdmin();
  if (deny) return deny;

  const session = await auth();
  const actorId = Number(session!.user!.id);

  const parsed = superAdminUpdateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  if (
    data.role === "admin" ||
    data.role === "student" ||
    data.role === "instructor"
  ) {
    if (
      data.organizationId === undefined ||
      data.organizationId === null
    ) {
      return {
        ok: false,
        error: "Selecione uma escola para este perfil",
      };
    }
  }

  try {
    await updateUserBySuperAdmin(userId, actorId, data);
    revalidatePath("/super-admin/usuarios");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar usuário",
    };
  }
}
