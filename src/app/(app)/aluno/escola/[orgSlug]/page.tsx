import type { Metadata } from "next";
import {
  getOrganizationForMetadata,
  getOrganizationFromEscolaParam,
} from "@/lib/resolve-org";
import { loadSchoolLandingData } from "@/components/school/school-landing-data";
import { SchoolLandingView } from "@/components/school/school-landing-view";

type Props = { params: Promise<{ orgSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getOrganizationForMetadata(orgSlug);
  if (!org) return { title: "Escola" };
  return { title: org.name };
}

export default async function AlunoEscolaPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await getOrganizationFromEscolaParam(orgSlug);
  const data = await loadSchoolLandingData(org);
  return <SchoolLandingView data={data} />;
}
