import { PublicJourneyShellWithAuth } from "@/components/layout/public-journey-shell-with-auth";

export default function PublicSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicJourneyShellWithAuth>{children}</PublicJourneyShellWithAuth>;
}
