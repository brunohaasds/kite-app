import { PublicJourneyShellWithAuth } from "@/components/layout/public-journey-shell-with-auth";

export default function PublicSpotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicJourneyShellWithAuth>{children}</PublicJourneyShellWithAuth>;
}
