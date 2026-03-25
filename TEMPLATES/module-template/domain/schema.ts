/**
 * Schemas Zod — [NomeDoRecurso]
 *
 * Validação de entrada. Usar tanto em Server Actions quanto em formulários (React Hook Form).
 */

import { z } from "zod";

// ─── Create ────────────────────────────────────────────────────────────────

export const createNomeDoRecursoSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres"),

  description: z.string().max(1000).optional().nullable(),

  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

export type CreateNomeDoRecursoData = z.infer<typeof createNomeDoRecursoSchema>;

// ─── Update ────────────────────────────────────────────────────────────────

export const updateNomeDoRecursoSchema = createNomeDoRecursoSchema.partial().extend({
  // Campos que nunca mudam em update podem ser removidos aqui
});

export type UpdateNomeDoRecursoData = z.infer<typeof updateNomeDoRecursoSchema>;

// ─── Filtros de listagem ───────────────────────────────────────────────────

export const listNomeDoRecursoFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export type ListNomeDoRecursoFilters = z.infer<typeof listNomeDoRecursoFiltersSchema>;