import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escola de Kitesurf — Kite App",
  description:
    "Escola de kitesurf com instrutores certificados. Agende sua aula agora.",
  openGraph: {
    title: "Escola de Kitesurf — Kite App",
    description: "Agende sua aula de kitesurf com instrutores certificados.",
    type: "website",
  },
};

export default function EscolaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
