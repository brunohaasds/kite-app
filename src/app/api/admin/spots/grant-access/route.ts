import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { grantAccessSchema } from "@/domain/global-spots/schema";
import { grantAccess } from "@/domain/global-spots/repo";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Sem organização" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = grantAccessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const spot = await prisma.global_spots.findFirst({
    where: { id: parsed.data.global_spot_id, deleted_at: null },
  });
  if (!spot) {
    return NextResponse.json({ error: "Spot não encontrado" }, { status: 404 });
  }

  const isSuperAdmin = session.user.role === "superadmin";
  if (!isSuperAdmin && spot.owner_organization_id !== orgId) {
    return NextResponse.json(
      { error: "Apenas o dono do spot pode conceder acesso" },
      { status: 403 },
    );
  }

  try {
    const perm = await grantAccess(
      parsed.data.global_spot_id,
      parsed.data.organization_id,
      parseInt(session.user.id, 10),
    );
    return NextResponse.json(perm);
  } catch {
    return NextResponse.json(
      { error: "Erro ao conceder acesso" },
      { status: 500 },
    );
  }
}
