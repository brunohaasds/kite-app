import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bookSlot } from "@/domain/agendas/repo";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
    }

    const slot = await prisma.agenda_slots.findUnique({
      where: { id: Number(slotId) },
      include: { agenda: true },
    });

    if (!slot || slot.booked) {
      return NextResponse.json({ error: "Slot unavailable" }, { status: 400 });
    }

    await bookSlot(slot.id);

    const student = await prisma.students.findFirst({
      where: { user_id: Number(session.user.id), deleted_at: null },
    });

    await prisma.sessions.create({
      data: {
        organization_id: slot.agenda.organization_id,
        spot_id: slot.spot_id,
        instructor_id: slot.instructor_id,
        student_id: student?.id,
        agenda_slot_id: slot.id,
        date: slot.agenda.date,
        start_time: slot.time,
        status: "scheduled",
        type: "Agenda compartilhada",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
