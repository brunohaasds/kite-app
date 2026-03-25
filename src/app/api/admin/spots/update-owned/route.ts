import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { update } from "@/domain/global-spots/repo";

const schema = z.object({
  id: z.number().int(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
  services: z.array(z.string()).optional().nullable(),
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
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const spot = await prisma.global_spots.findFirst({
    where: { id: parsed.data.id, owner_organization_id: orgId, deleted_at: null },
  });
  if (!spot) {
    return NextResponse.json(
      { error: "Spot não encontrado ou sem permissão" },
      { status: 404 },
    );
  }

  const { id, ...data } = parsed.data;
  try {
    const updated = await update(id, data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar spot" },
      { status: 500 },
    );
  }
}
