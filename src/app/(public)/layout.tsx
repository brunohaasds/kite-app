import { MobileContainer } from "@/components/layout/mobile-container";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <MobileContainer>{children}</MobileContainer>
    </main>
  );
}
