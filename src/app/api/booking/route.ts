import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookSlot } from "@/domain/agendas/repo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slotId, orgId, name, phone, level } = body;

    if (!slotId || !orgId || !name || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slot = await prisma.agenda_slots.findUnique({
      where: { id: Number(slotId) },
    });

    if (!slot || slot.booked) {
      return NextResponse.json({ error: "Slot unavailable" }, { status: 400 });
    }

    await bookSlot(slot.id);

    await prisma.sessions.create({
      data: {
        organization_id: Number(orgId),
        spot_id: slot.spot_id,
        instructor_id: slot.instructor_id,
        agenda_slot_id: slot.id,
        date: (await prisma.agendas.findUnique({ where: { id: slot.agenda_id } }))!.date,
        start_time: slot.time,
        status: "scheduled",
        type: "Agendamento público",
        notes: `Nome: ${name}, Tel: ${phone}, Nível: ${level ?? "não informado"}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
