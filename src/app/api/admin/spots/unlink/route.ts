import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { unlinkSpot } from "@/domain/global-spots/repo";
import { prisma } from "@/lib/db";

const schema = z.object({ spot_id: z.number().int() });

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

  const spot = await prisma.spots.findFirst({
    where: { id: parsed.data.spot_id, organization_id: orgId, deleted_at: null },
  });
  if (!spot) {
    return NextResponse.json({ error: "Spot não encontrado" }, { status: 404 });
  }

  try {
    await unlinkSpot(parsed.data.spot_id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao desvincular spot" },
      { status: 500 },
    );
  }
}
