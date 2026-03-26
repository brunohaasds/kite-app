import { notFound, redirect } from "next/navigation";
import { getById, getBySlug } from "@/domain/organizations/repo";
import type { Organization } from "@/domain/organizations/types";

/** Para metadata: aceita id ou slug sem redirecionar. */
export async function getOrganizationForMetadata(
  param: string,
): Promise<Organization | null> {
  if (/^\d+$/.test(param)) {
    return getById(Number(param));
  }
  return getBySlug(param);
}

/**
 * Resolve escola URL segment: slug canônico, ou id numérico (redireciona para /escola/[slug]).
 */
export async function getOrganizationFromEscolaParam(param: string): Promise<Organization> {
  if (/^\d+$/.test(param)) {
    const org = await getById(Number(param));
    if (!org) notFound();
    redirect(`/escola/${org.slug}`);
  }
  const org = await getBySlug(param);
  if (!org) notFound();
  return org;
}
