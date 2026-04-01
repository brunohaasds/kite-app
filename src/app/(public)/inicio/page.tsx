import type { Metadata } from "next";
import { PublicJourneyShellWithAuth } from "@/components/layout/public-journey-shell-with-auth";
import { EkiteHomePage } from "@/components/marketing/ekite-home-page";

export const metadata: Metadata = {
  title: "eKite — Menos barreiras. Mais kite.",
  description:
    "Plataforma para riders, escolas e spots: agenda, spots, centros e presença digital. O futuro do kite é conectado.",
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "eKite — Menos barreiras. Mais kite.",
    description:
      "Conectamos riders, escolas e spots num único ecossistema. Descobre spots, agenda aulas e gere a tua escola.",
    type: "website",
  },
};

export default function InicioMarketingPage() {
  return (
    <PublicJourneyShellWithAuth>
      <EkiteHomePage />
    </PublicJourneyShellWithAuth>
  );
}
