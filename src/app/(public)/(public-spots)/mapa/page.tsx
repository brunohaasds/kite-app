export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import {
  listPublicMapFilterOptions,
  listPublicMapMarkers,
  listPublicMapStateKpis,
} from "@/domain/global-spots/repo";
import { SpotsMapExploreClient } from "@/components/spots/spots-map-explore-client";

export const metadata: Metadata = {
  title: "Mapa dos spots",
  description: "Explore spots de kitesurf no mapa, com filtros por região.",
};

async function MapaBody({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; state?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const [markers, filterOptions, stateKpis] = await Promise.all([
    listPublicMapMarkers({
      country: sp.country,
      state: sp.state,
      q,
    }),
    listPublicMapFilterOptions(),
    listPublicMapStateKpis(),
  ]);

  return (
    <SpotsMapExploreClient
      markers={markers}
      countries={filterOptions.countries}
      states={filterOptions.states}
      stateKpis={stateKpis}
      pathPrefix=""
    />
  );
}

export default function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; state?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando…</div>}>
      <MapaBody searchParams={searchParams} />
    </Suspense>
  );
}
