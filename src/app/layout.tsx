import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PwaSerwistProvider } from "@/components/pwa/serwist-provider";
import "./globals.css";

const THEME_COLOR = "#0d9488";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  applicationName: "eKite",
  title: {
    default: "eKite — Gestão de escolas de kitesurf",
    template: "%s | eKite",
  },
  description:
    "Plataforma de gestão operacional para escolas de kitesurf. Agenda, alunos, pacotes e financeiro.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "eKite",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PwaSerwistProvider>
            {children}
            <Toaster richColors position="top-center" />
          </PwaSerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
