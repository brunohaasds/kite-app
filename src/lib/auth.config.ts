import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import {
  getAuthBaseUrl,
  getInternalSessionSecret,
  USER_SESSION_REVALIDATE_INTERVAL_SEC,
} from "@/lib/auth-session-revalidate";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT | null> {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.lastUserCheckAt = Math.floor(Date.now() / 1000);
        return token;
      }

      const userId = token.id as string | undefined;
      if (!userId) {
        return token;
      }

      const secret = getInternalSessionSecret();
      if (!secret) {
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const last = token.lastUserCheckAt as number | undefined;
      if (
        last != null &&
        now - last < USER_SESSION_REVALIDATE_INTERVAL_SEC
      ) {
        return token;
      }

      const base = getAuthBaseUrl();
      try {
        const res = await fetch(`${base}/api/internal/session-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({ userId: parseInt(userId, 10) }),
          cache: "no-store",
        });

        if (!res.ok) {
          return token;
        }

        const data = (await res.json()) as { valid?: boolean };
        if (!data.valid) {
          return null;
        }

        return { ...token, lastUserCheckAt: now };
      } catch {
        return token;
      }
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      let orgId = token.organizationId as number | null;

      if (token.role === "superadmin") {
        try {
          const cookieStore = await cookies();
          const saOrgId = cookieStore.get("sa-org-id")?.value;
          if (saOrgId) {
            orgId = parseInt(saOrgId, 10);
          }
        } catch {
          // cookies() not available in edge/middleware - ignore
        }
      }

      session.user.organizationId = orgId;
      return session;
    },
  },
};
