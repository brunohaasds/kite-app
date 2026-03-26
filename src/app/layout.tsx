import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { EKITE_LOGO_URL } from "@/lib/branding";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "eKite — Gestão de escolas de kitesurf",
    template: "%s | eKite",
  },
  description:
    "Plataforma de gestão operacional para escolas de kitesurf. Agenda, alunos, pacotes e financeiro.",
  icons: {
    icon: EKITE_LOGO_URL,
    apple: EKITE_LOGO_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
