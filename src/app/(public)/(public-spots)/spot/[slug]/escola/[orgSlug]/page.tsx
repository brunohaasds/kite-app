import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBySlug } from "@/domain/global-spots/repo";
import {
  getOrganizationForMetadata,
  getOrganizationFromEscolaParam,
} from "@/lib/resolve-org";
import { isOrganizationOnGlobalSpot } from "@/lib/spot-org";
import { loadSchoolLandingData } from "@/components/school/school-landing-data";
import { SchoolLandingView } from "@/components/school/school-landing-view";
import { ChevronRight } from "@/lib/icons";

type Props = { params: Promise<{ slug: string; orgSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, orgSlug } = await params;
  const [spot, org] = await Promise.all([
    findBySlug(slug),
    getOrganizationForMetadata(orgSlug),
  ]);
  if (!spot || !org) return { title: "Escola" };
  if (!isOrganizationOnGlobalSpot(spot, org.id)) return { title: "Escola" };
  return { title: `${org.name} · ${spot.name}` };
}

export default async function SpotContextSchoolPage({ params }: Props) {
  const { slug, orgSlug } = await params;
  const spot = await findBySlug(slug);
  const org = await getOrganizationFromEscolaParam(orgSlug);
  if (!spot || !isOrganizationOnGlobalSpot(spot, org.id)) notFound();

  const data = await loadSchoolLandingData(org);

  return (
    <SchoolLandingView
      data={data}
      topSlot={
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/spots" className="hover:text-foreground">
            Spots
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={`/spot/${spot.slug}`} className="hover:text-foreground">
            {spot.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{org.name}</span>
        </div>
      }
    />
  );
}
