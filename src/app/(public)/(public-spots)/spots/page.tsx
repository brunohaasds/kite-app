export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { listPublicDirectory } from "@/domain/global-spots/repo";
import { SpotsDirectoryClient } from "@/components/spots/spots-directory-client";

export const metadata: Metadata = {
  title: "Spots de kitesurf",
  description: "Explore spots e escolas de kitesurf por região.",
};

async function SpotsBody({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; state?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const [spots, filterRows] = await Promise.all([
    listPublicDirectory({
      country: sp.country,
      state: sp.state,
      q,
    }),
    prisma.global_spots.findMany({
      where: { deleted_at: null, parent_spot_id: null },
      select: { country: true, state: true },
    }),
  ]);
  const countries = [
    ...new Set(
      filterRows.map((r: { country: string | null }) => r.country).filter(Boolean),
    ),
  ] as string[];
  const states = [
    ...new Set(filterRows.map((r: { state: string | null }) => r.state).filter(Boolean)),
  ] as string[];
  countries.sort();
  states.sort();

  return (
    <SpotsDirectoryClient
      initialSpots={spots}
      countries={countries}
      states={states}
      pathPrefix=""
    />
  );
}

export default function SpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; state?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando…</div>}>
      <SpotsBody searchParams={searchParams} />
    </Suspense>
  );
}
