"use server";

/**
 * Server Actions — [NomeDoRecurso]
 *
 * Orquestração apenas: auth → validate → domain → revalidate.
 * Nunca colocar queries Prisma aqui.
 */

import { revalidatePath } from "next/cache";
import { requireActionPermission } from "@/lib/rbac/require-permission";
import {
  createNomeDoRecursoSchema,
  updateNomeDoRecursoSchema,
  listNomeDoRecursoFiltersSchema,
  type ListNomeDoRecursoFilters,
} from "@/domain/<modulo>/nome-do-recurso/schema";
import {
  listNomeDoRecurso,
  createNomeDoRecurso,
  updateNomeDoRecurso,
  deleteNomeDoRecurso,
} from "@/domain/<modulo>/nome-do-recurso/repo";

// ─── Helper: SessionUser a partir do token ────────────────────────────────

function toSessionUser(user: {
  id?: string;
  clientId?: number | null;
  role?: string;
}) {
  return {
    userId: user.id ? parseInt(user.id, 10) : null,
    clientId: user.clientId ?? null,
    role: user.role ?? "user",
  };
}

// ─── List ──────────────────────────────────────────────────────────────────

export async function listAction(filters: Partial<ListNomeDoRecursoFilters> = {}) {
  const session = await requireActionPermission("nome_do_recurso", "view");
  const sessionUser = toSessionUser(session.user);
  const parsed = listNomeDoRecursoFiltersSchema.parse(filters);
  return listNomeDoRecurso(parsed, sessionUser);
}

// ─── Create ────────────────────────────────────────────────────────────────

export async function createAction(formData: unknown) {
  const session = await requireActionPermission("nome_do_recurso", "create");
  const sessionUser = toSessionUser(session.user);

  const data = createNomeDoRecursoSchema.parse(formData);
  await createNomeDoRecurso(data, sessionUser);

  revalidatePath("/(app)/nome-do-recurso");
  return { success: true };
}

// ─── Update ────────────────────────────────────────────────────────────────

export async function updateAction(uuid: string, formData: unknown) {
  const session = await requireActionPermission("nome_do_recurso", "edit");
  const sessionUser = toSessionUser(session.user);

  const data = updateNomeDoRecursoSchema.parse(formData);
  await updateNomeDoRecurso(uuid, data, sessionUser);

  revalidatePath("/(app)/nome-do-recurso");
  return { success: true };
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteAction(uuid: string) {
  const session = await requireActionPermission("nome_do_recurso", "delete");
  const sessionUser = toSessionUser(session.user);

  await deleteNomeDoRecurso(uuid, sessionUser);

  revalidatePath("/(app)/nome-do-recurso");
  return { success: true };
}
