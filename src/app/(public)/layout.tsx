import { PublicMobileNav } from "@/components/layout/public-bottom-nav";
import { auth } from "@/lib/auth";
import type { PublicNavSessionUser } from "@/components/layout/public-journey-shell";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const sessionUser: PublicNavSessionUser = session?.user?.role
    ? { role: session.user.role }
    : null;

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <PublicMobileNav sessionUser={sessionUser}>{children}</PublicMobileNav>
    </main>
  );
}
