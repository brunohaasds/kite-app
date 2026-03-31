const MAX_CALLBACK_PATH_LEN = 2048;

/**
 * Home da área autenticada por role (alinhado com middleware).
 */
export function getAppHomePath(role?: string | null): string {
  if (role === "superadmin") return "/super-admin";
  if (role === "admin") return "/admin/agenda";
  if (role === "instructor") return "/instrutor/agenda";
  if (role === "service_provider") return "/prestador";
  return "/aluno/aulas";
}

/**
 * Valida callbackUrl para evitar open redirect (apenas path interno).
 */
export function isSafeInternalPath(candidate: string): boolean {
  if (!candidate || candidate.length > MAX_CALLBACK_PATH_LEN) return false;
  if (!candidate.startsWith("/")) return false;
  if (candidate.startsWith("//")) return false;
  if (candidate.includes("://")) return false;
  const lower = candidate.toLowerCase();
  if (lower.startsWith("/javascript:") || candidate.includes("\0")) return false;
  return true;
}

/**
 * Destino após já autenticado em /login (ou guard server): callback seguro ou home por role.
 */
export function resolvePostLoginRedirect(
  callbackUrl: string | null | undefined,
  role?: string | null,
): string {
  if (callbackUrl && isSafeInternalPath(callbackUrl)) return callbackUrl;
  return getAppHomePath(role);
}
