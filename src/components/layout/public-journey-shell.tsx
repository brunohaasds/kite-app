import { PublicSiteHeader } from "@/components/layout/public-site-header";

export function PublicJourneyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicSiteHeader />
      <div className="mx-auto w-full max-w-[480px] flex-1 md:max-w-7xl md:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
