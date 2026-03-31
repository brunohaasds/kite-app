import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolvePostLoginRedirect } from "@/lib/auth-routes";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) {
    redirect(
      resolvePostLoginRedirect(params.callbackUrl, session.user.role),
    );
  }
  return <LoginClient />;
}
