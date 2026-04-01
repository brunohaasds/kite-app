/**
 * Logo da marca. Sobrescreve com `NEXT_PUBLIC_EKITE_LOGO_URL` (URL absoluta ou caminho em `public/`, ex. `/marketing/logo.png`).
 * Fallback: Vercel Blob público.
 */
export const EKITE_LOGO_URL =
  process.env.NEXT_PUBLIC_EKITE_LOGO_URL?.trim() ||
  "https://acbalst6mhxinp7r.public.blob.vercel-storage.com/logo/logo.png";

/**
 * Fundo do hero da página pública `/spots`.
 * Sobrescreve com `NEXT_PUBLIC_EKITE_SPOTS_HERO_BG` (URL absoluta ou caminho em `public/`, ex. `/marketing/spots.jpg`).
 * Fallback: CDN (mesmo conjunto de assets da landing).
 */
export const EKITE_SPOTS_DIRECTORY_HERO_BG =
  process.env.NEXT_PUBLIC_EKITE_SPOTS_HERO_BG?.trim() ||
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-spot-discovery-iTvbAFJ8dkkQV2QcfpjSub.webp";
