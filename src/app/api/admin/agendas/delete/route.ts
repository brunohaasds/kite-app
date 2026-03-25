import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  uuid: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "uuid é obrigatório" }, { status: 400 });
    }

    const orgId = session.user.organizationId!;
    const now = new Date();

    const agenda = await prisma.agendas.findFirst({
      where: { uuid: parsed.data.uuid, organization_id: orgId, deleted_at: null },
    });

    if (!agenda) {
      return NextResponse.json({ error: "Agenda não encontrada" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.agenda_slots.updateMany({
        where: { agenda_id: agenda.id },
        data: { deleted_at: now },
      }),
      prisma.agendas.update({
        where: { id: agenda.id },
        data: { deleted_at: now },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
