import { auth } from "@/lib/auth";
import {
  PublicJourneyShell,
  type PublicNavSessionUser,
} from "@/components/layout/public-journey-shell";

export async function PublicJourneyShellWithAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const sessionUser: PublicNavSessionUser = session?.user?.role
    ? { role: session.user.role }
    : null;

  return (
    <PublicJourneyShell sessionUser={sessionUser}>{children}</PublicJourneyShell>
  );
}
