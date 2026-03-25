import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  slotId: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "slotId é obrigatório" }, { status: 400 });
    }

    const orgId = session.user.organizationId!;

    const slot = await prisma.agenda_slots.findFirst({
      where: { id: parsed.data.slotId, deleted_at: null },
      include: { agenda: { select: { organization_id: true } } },
    });

    if (!slot || slot.agenda.organization_id !== orgId) {
      return NextResponse.json({ error: "Slot não encontrado" }, { status: 404 });
    }

    await prisma.agenda_slots.update({
      where: { id: slot.id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
