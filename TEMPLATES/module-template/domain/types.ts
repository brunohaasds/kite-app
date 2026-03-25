/**
 * Types — [NomeDoRecurso]
 *
 * Interfaces TypeScript para o recurso. Importar em repo.ts, actions.ts e componentes.
 */

// ─── Interface principal (espelha a tabela Prisma) ─────────────────────────

export interface NomeDoRecurso {
  id: number;
  uuid: string;
  client_id: number;
  name: string;
  description?: string | null;
  status: NomeDoRecursoStatus;
  settings?: Record<string, unknown> | null; // JSONB (se houver)
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

// ─── Status (adaptar para o domínio) ───────────────────────────────────────

export type NomeDoRecursoStatus = "active" | "inactive" | "pending";

// ─── Interface com relações (para listagens com JOIN) ─────────────────────

export interface NomeDoRecursoWithRelations extends NomeDoRecurso {
  // Exemplo: relação com outra entidade
  // owner?: { id: number; name: string } | null;
}

// ─── Tipo para formulários ─────────────────────────────────────────────────

export type CreateNomeDoRecursoInput = {
  name: string;
  description?: string | null;
  status?: NomeDoRecursoStatus;
};

export type UpdateNomeDoRecursoInput = Partial<CreateNomeDoRecursoInput>;

// ─── SessionUser (padrão do projeto — não alterar) ────────────────────────

export interface SessionUser {
  userId: number | null;
  clientId: number | null;
  role: string;
}