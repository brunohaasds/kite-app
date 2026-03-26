import { PublicJourneyShell } from "@/components/layout/public-journey-shell";

export default function PublicSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicJourneyShell>{children}</PublicJourneyShell>;
}
