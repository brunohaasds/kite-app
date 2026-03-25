import { requireAdmin } from "@/lib/rbac/require-permission";
import { listByOrg } from "@/domain/instructors/repo";
import { InstrutoresClient } from "./instrutores-client";

export default async function InstrutoresPage() {
  const session = await requireAdmin();
  const orgId = session.user.organizationId!;

  const instructors = await listByOrg(orgId);

  const serialized = instructors.map((i) => ({
    id: i.id,
    uuid: i.uuid,
    name: i.name,
    email: i.email,
    phone: i.phone,
    bio: i.bio,
    avatar: i.avatar,
    certification: i.certification,
    experience_years: i.experience_years,
    extras: i.extras,
  }));

  return <InstrutoresClient instructors={serialized} />;
}
