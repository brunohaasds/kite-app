import { requireAdmin } from "@/lib/rbac/require-permission";
import { getById } from "@/domain/organizations/repo";
import { EscolaClient } from "./escola-client";

export default async function EscolaPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const org = await getById(orgId);
  if (!org) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Organização não encontrada.
      </div>
    );
  }

  return (
    <EscolaClient
      org={{
        id: org.id,
        name: org.name,
        description: org.description,
        avatar: org.avatar,
        hero_image: org.hero_image,
        whatsapp: org.whatsapp,
        instagram: org.instagram,
        site: org.site,
      }}
    />
  );
}
