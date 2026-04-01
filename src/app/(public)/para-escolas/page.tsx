import type { Metadata } from "next";
import { PublicJourneyShellWithAuth } from "@/components/layout/public-journey-shell-with-auth";
import { EkiteParaEscolasPage } from "@/components/marketing/ekite-para-escolas-page";

export const metadata: Metadata = {
  title: "eKite para escolas — Infraestrutura digital do kitesurf",
  description:
    "Agenda, aulas, instrutores, spots e crescimento numa só plataforma. Menos burocracia, mais tempo para ensinar e viver o kite.",
  openGraph: {
    title: "eKite para escolas",
    description:
      "Organiza a operação da tua escola de kitesurf e eleva a experiência dos teus alunos.",
    type: "website",
  },
};

export default function ParaEscolasMarketingPage() {
  return (
    <PublicJourneyShellWithAuth>
      <EkiteParaEscolasPage />
    </PublicJourneyShellWithAuth>
  );
}
