import type { MetadataRoute } from "next";

/** Cor primária (teal) alinhada à marca; barra de estado / splash PWA. */
const THEME_COLOR = "#0d9488";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eKite — Gestão de escolas de kitesurf",
    short_name: "eKite",
    description:
      "Plataforma para riders, escolas e spots: agenda, pacotes e presença digital.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: THEME_COLOR,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
