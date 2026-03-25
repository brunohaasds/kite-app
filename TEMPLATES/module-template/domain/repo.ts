/**
 * Repository — [NomeDoRecurso]
 *
 * Queries Prisma apenas. Sem lógica de negócio, sem auth, sem validação Zod.
 * Recebe sempre sessionUser para aplicar scope de client.
 */

import { prisma } from "@/lib/db";
import type { SessionUser } from "./types";
import type {
  CreateNomeDoRecursoData,
  ListNomeDoRecursoFilters,
  UpdateNomeDoRecursoData,
} from "./schema";

// ─── Scope helper ──────────────────────────────────────────────────────────

function scopeWhere(sessionUser: SessionUser) {
  if (sessionUser.role === "super_admin") return {};
  return { client_id: sessionUser.clientId };
}

// ─── List ──────────────────────────────────────────────────────────────────

export async function listNomeDoRecurso(
  filters: ListNomeDoRecursoFilters,
  sessionUser: SessionUser
) {
  const skip = (filters.page - 1) * filters.pageSize;

  const where = {
    ...scopeWhere(sessionUser),
    deleted_at: null,
    ...(filters.status && { status: filters.status }),
    ...(filters.search && {
      name: { contains: filters.search, mode: "insensitive" as const },
    }),
  };

  const [rows, totalCount] = await Promise.all([
    prisma.nome_do_recurso.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: filters.pageSize,
      skip,
      // include: { owner: { select: { id: true, name: true } } },
    }),
    prisma.nome_do_recurso.count({ where }),
  ]);

  return {
    rows,
    totalCount,
    pageCount: Math.ceil(totalCount / filters.pageSize),
  };
}

// ─── Get by UUID ───────────────────────────────────────────────────────────

export async function getNomeDoRecursoByUuid(
  uuid: string,
  sessionUser: SessionUser
) {
  return prisma.nome_do_recurso.findFirst({
    where: {
      uuid,
      deleted_at: null,
      ...scopeWhere(sessionUser),
    },
  });
}

// ─── Create ────────────────────────────────────────────────────────────────

export async function createNomeDoRecurso(
  data: CreateNomeDoRecursoData,
  sessionUser: SessionUser
) {
  if (!sessionUser.clientId) throw new Error("client_id obrigatório");

  return prisma.nome_do_recurso.create({
    data: {
      ...data,
      client_id: sessionUser.clientId,
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────

export async function updateNomeDoRecurso(
  uuid: string,
  data: UpdateNomeDoRecursoData,
  sessionUser: SessionUser
) {
  const existing = await getNomeDoRecursoByUuid(uuid, sessionUser);
  if (!existing) throw new Error("Recurso não encontrado");

  return prisma.nome_do_recurso.update({
    where: { id: existing.id },
    data,
  });
}

// ─── Delete (soft) ─────────────────────────────────────────────────────────

export async function deleteNomeDoRecurso(
  uuid: string,
  sessionUser: SessionUser
) {
  const existing = await getNomeDoRecursoByUuid(uuid, sessionUser);
  if (!existing) throw new Error("Recurso não encontrado");

  return prisma.nome_do_recurso.update({
    where: { id: existing.id },
    data: { deleted_at: new Date() },
  });
}
