import { PublicJourneyShell } from "@/components/layout/public-journey-shell";

export default function PublicSpotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicJourneyShell>{children}</PublicJourneyShell>;
}
