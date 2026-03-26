/**
 * Logo da marca. Sobrescreve com `NEXT_PUBLIC_EKITE_LOGO_URL` (URL absoluta ou caminho em `public/`, ex. `/marketing/logo.png`).
 * Fallback: Vercel Blob público.
 */
export const EKITE_LOGO_URL =
  process.env.NEXT_PUBLIC_EKITE_LOGO_URL?.trim() ||
  "https://acbalst6mhxinp7r.public.blob.vercel-storage.com/logo/logo.png";
