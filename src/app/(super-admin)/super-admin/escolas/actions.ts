"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/domain/organizations/schema";
import * as orgRepo from "@/domain/organizations/repo";

export type SuperAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function assertSuperAdmin(): Promise<SuperAdminActionResult | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return { ok: false, error: "Não autorizado" };
  }
  return null;
}

export async function createOrganizationAction(
  input: unknown,
): Promise<SuperAdminActionResult> {
  const deny = await assertSuperAdmin();
  if (deny) return deny;

  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await orgRepo.create(parsed.data);
    revalidatePath("/super-admin/escolas");
    revalidatePath("/centers");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao criar escola",
    };
  }
}

export async function updateOrganizationAction(
  id: number,
  input: unknown,
): Promise<SuperAdminActionResult> {
  const deny = await assertSuperAdmin();
  if (deny) return deny;

  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const before = await orgRepo.getById(id);
    const org = await orgRepo.update(id, parsed.data);
    revalidatePath("/super-admin/escolas");
    revalidatePath("/centers");
    if (before?.slug) {
      revalidatePath(`/escola/${before.slug}`);
    }
    revalidatePath(`/escola/${org.slug}`);
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Erro ao atualizar escola";
    return { ok: false, error: msg };
  }
}
