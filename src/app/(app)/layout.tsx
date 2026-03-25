import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background pb-16">
      <MobileContainer className="p-4">{children}</MobileContainer>
      <BottomNav />
    </main>
  );
}
