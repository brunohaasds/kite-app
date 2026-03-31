import { PublicSiteHeader } from "@/components/layout/public-site-header";

export type PublicNavSessionUser = { role: string } | null;

export function PublicJourneyShell({
  children,
  sessionUser = null,
}: {
  children: React.ReactNode;
  sessionUser?: PublicNavSessionUser;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader sessionUser={sessionUser} />
      <div className="mx-auto w-full max-w-[480px] flex-1 md:max-w-7xl md:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
