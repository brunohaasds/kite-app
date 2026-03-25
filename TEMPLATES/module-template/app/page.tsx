/**
 * Page — [NomeDoRecurso]
 *
 * Server Component. Só fetch + render. Nunca "use client".
 */

import { requirePermission } from "@/lib/rbac/require-permission";
import { listNomeDoRecurso } from "@/domain/<modulo>/nome-do-recurso/repo";
import { NomeDoRecursoClient } from "./nome-do-recurso-client";

export default async function NomeDoRecursoPage() {
  const session = await requirePermission("nome_do_recurso", "view");
  const sessionUser = {
    userId: session.user.id ? parseInt(session.user.id, 10) : null,
    clientId: session.user.clientId ?? null,
    role: session.user.role ?? "user",
  };

  const { rows, totalCount } = await listNomeDoRecurso(
    { page: 1, pageSize: 50 },
    sessionUser
  );

  return (
    <NomeDoRecursoClient
      initialData={rows}
      totalCount={totalCount}
      canCreate={true} // passar permissão granular se necessário
    />
  );
}
