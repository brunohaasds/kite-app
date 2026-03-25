import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { linkSpot } from "@/domain/global-spots/repo";

const schema = z.object({
  global_spot_id: z.number().int(),
});

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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const globalSpot = await prisma.global_spots.findFirst({
    where: { id: parsed.data.global_spot_id, deleted_at: null },
  });
  if (!globalSpot) {
    return NextResponse.json({ error: "Spot não encontrado" }, { status: 404 });
  }

  if (globalSpot.access === "private") {
    const isOwner = globalSpot.owner_organization_id === orgId;
    if (!isOwner) {
      const perm = await prisma.spot_permissions.findFirst({
        where: {
          global_spot_id: globalSpot.id,
          organization_id: orgId,
          status: "approved",
        },
      });
      if (!perm) {
        return NextResponse.json(
          { error: "Sem permissão para este spot" },
          { status: 403 },
        );
      }
    }
  }

  const existing = await prisma.spots.findFirst({
    where: {
      organization_id: orgId,
      global_spot_id: globalSpot.id,
      deleted_at: null,
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Spot já vinculado" },
      { status: 409 },
    );
  }

  try {
    const spot = await linkSpot(globalSpot.id, orgId, globalSpot.name);
    return NextResponse.json(spot);
  } catch {
    return NextResponse.json(
      { error: "Erro ao vincular spot" },
      { status: 500 },
    );
  }
}
