import type { Metadata } from "next";
import { PublicJourneyShell } from "@/components/layout/public-journey-shell";
import { EkiteHomePage } from "@/components/marketing/ekite-home-page";

export const metadata: Metadata = {
  title: "eKite — Menos fricção. Mais kite.",
  description:
    "Plataforma para riders, escolas e spots: agenda, spots, centros e presença digital. O vento é o que nos move.",
  openGraph: {
    title: "eKite — Menos fricção. Mais kite.",
    description:
      "Conectamos riders, escolas e spots num único ecossistema. Descobre spots, agenda aulas e gere a tua escola.",
    type: "website",
  },
};

export default function MarketingHomePage() {
  return (
    <PublicJourneyShell>
      <EkiteHomePage />
    </PublicJourneyShell>
  );
}
