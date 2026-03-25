import { requireAdmin } from "@/lib/rbac/require-permission";
import { listByOrg } from "@/domain/invites/repo";
import { ConvitesClient } from "./convites-client";

export default async function ConvitesPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const invites = await listByOrg(orgId);

  const serialized = invites.map((inv) => ({
    id: inv.id,
    uuid: inv.uuid,
    token: inv.token,
    email: inv.email,
    status: inv.status,
    invitedByName: inv.invitedByName,
    created_at: inv.created_at.toISOString(),
    expires_at: inv.expires_at.toISOString(),
    accepted_at: inv.accepted_at?.toISOString() ?? null,
  }));

  return <ConvitesClient invites={serialized} orgId={orgId} />;
}
