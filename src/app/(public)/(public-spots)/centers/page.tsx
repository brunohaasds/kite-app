export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { listPublicOrganizations } from "@/domain/organizations/repo";
import { CentersDirectoryClient } from "@/components/centers/centers-directory-client";

export const metadata: Metadata = {
  title: "Centros de kitesurf",
  description: "Descobre escolas e centros parceiros para aprender kitesurf.",
};

async function CentersBody() {
  const orgs = await listPublicOrganizations();
  return <CentersDirectoryClient initialOrgs={orgs} />;
}

export default function CentersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando…</div>}>
      <CentersBody />
    </Suspense>
  );
}
