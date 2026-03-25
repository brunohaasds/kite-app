import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string, deleted_at: null },
          include: {
            members: { select: { organization_id: true }, take: 1 },
          },
        });

        if (!user) return null;

        const passwordMatch = await compare(
          credentials.password as string,
          user.password,
        );
        if (!passwordMatch) return null;

        await prisma.users.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.members[0]?.organization_id ?? null,
        };
      },
    }),
  ],
});
