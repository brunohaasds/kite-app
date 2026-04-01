/** Shared between jwt callback (Edge-safe fetch) and internal API route (Prisma). */

export const USER_SESSION_REVALIDATE_INTERVAL_SEC = 30;

export function getInternalSessionSecret(): string | null {
  if (process.env.INTERNAL_SESSION_SECRET) {
    return process.env.INTERNAL_SESSION_SECRET;
  }
  if (process.env.AUTH_SECRET) {
    return `${process.env.AUTH_SECRET}:internal-session-user`;
  }
  return null;
}

export function getAuthBaseUrl(): string {
  const raw =
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
