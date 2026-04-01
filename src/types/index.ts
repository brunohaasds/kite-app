import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    organizationId?: number | null;
    lastUserCheckAt?: number;
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    organizationId?: number | null;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      organizationId?: number | null;
    } & DefaultSession["user"];
  }
}
