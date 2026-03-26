import type { Metadata } from "next";
import { getOrganizationForMetadata, getOrganizationFromEscolaParam } from "@/lib/resolve-org";
import { loadSchoolLandingData } from "@/components/school/school-landing-data";
import { SchoolLandingView } from "@/components/school/school-landing-view";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getOrganizationForMetadata(orgSlug);
  if (!org) {
    return { title: "Escola não encontrada" };
  }
  return {
    title: `${org.name} - Agendar Aula`,
    ...(org.description ? { description: org.description } : {}),
  };
}

export default async function SchoolLandingPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await getOrganizationFromEscolaParam(orgSlug);
  const data = await loadSchoolLandingData(org);
  return <SchoolLandingView data={data} />;
}
