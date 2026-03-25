import { requireAuth } from "@/lib/rbac/require-permission";
import { listByUser } from "@/domain/invites/repo";
import { prisma } from "@/lib/db";
import { ConvidarClient } from "./convidar-client";

export default async function ConvidarPage() {
  const session = await requireAuth();
  const userId = Number(session.user.id);

  const member = await prisma.members.findFirst({
    where: { user_id: userId, deleted_at: null },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!member) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Você não está vinculado a nenhuma escola.
      </div>
    );
  }

  const invites = await listByUser(userId);

  const serialized = invites.map((inv) => ({
    id: inv.id,
    uuid: inv.uuid,
    token: inv.token,
    email: inv.email,
    status: inv.status,
    orgName: inv.orgName,
    created_at: inv.created_at.toISOString(),
    expires_at: inv.expires_at.toISOString(),
    accepted_at: inv.accepted_at?.toISOString() ?? null,
  }));

  return (
    <ConvidarClient
      invites={serialized}
      orgId={member.organization.id}
      orgName={member.organization.name}
    />
  );
}
