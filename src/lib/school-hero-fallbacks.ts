/**
 * Imagens em `public/hero/` quando `organizations.hero_image` é null.
 * Adiciona ficheiros com estes nomes ou edita a lista.
 */
export const SCHOOL_HERO_FALLBACK_PATHS = [
  "/hero/hero-01.jpg",
  "/hero/hero-02.jpg",
  "/hero/hero-03.jpg",
] as const;

export function pickSchoolHeroFallback(organizationId: number): string {
  const paths = SCHOOL_HERO_FALLBACK_PATHS;
  const i = Math.abs(organizationId) % paths.length;
  return paths[i]!;
}
