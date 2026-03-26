import { MobileContainer } from "@/components/layout/mobile-container";

export default function PublicAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileContainer>{children}</MobileContainer>;
}
