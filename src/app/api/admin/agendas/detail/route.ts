import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");
    if (!uuid) {
      return NextResponse.json({ error: "uuid é obrigatório" }, { status: 400 });
    }

    const orgId = session.user.organizationId!;

    const agenda = await prisma.agendas.findFirst({
      where: { uuid, organization_id: orgId, deleted_at: null },
      include: {
        slots: {
          where: { deleted_at: null },
          orderBy: [{ time: "asc" }],
          include: {
            instructor: { include: { user: { select: { name: true } } } },
            spot: { select: { name: true } },
          },
        },
      },
    });

    if (!agenda) {
      return NextResponse.json({ error: "Agenda não encontrada" }, { status: 404 });
    }

    const slots = agenda.slots.map((s) => ({
      time: s.time,
      instructorId: s.instructor_id,
      instructorName: s.instructor?.user.name ?? "—",
      spotId: s.spot_id,
      spotName: s.spot?.name ?? null,
    }));

    return NextResponse.json({
      uuid: agenda.uuid,
      date: agenda.date.toISOString(),
      dayName: agenda.day_name,
      slug: agenda.slug,
      slots,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
