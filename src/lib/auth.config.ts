import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
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
