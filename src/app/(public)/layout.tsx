import { PublicMobileNav } from "@/components/layout/public-bottom-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <PublicMobileNav>{children}</PublicMobileNav>
    </main>
  );
}
