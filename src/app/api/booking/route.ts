import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bookSlot } from "@/domain/agendas/repo";
import { useCredit, purchase } from "@/domain/packages/repo";

const bookingSchema = z.object({
  slotId: z.number().int().positive(),
  orgId: z.number().int().positive(),
  lessonType: z.enum(["avulsa", "pacote_credito", "pacote_novo"]),
  studentPackageId: z.number().int().positive().optional(),
  packageId: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { slotId, orgId, lessonType, studentPackageId, packageId } = parsed.data;

    const student = await prisma.students.findFirst({
      where: { user_id: Number(session.user.id), deleted_at: null },
    });

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const slot = await prisma.agenda_slots.findUnique({
      where: { id: slotId },
      include: { agenda: { select: { date: true } } },
    });

    if (!slot || slot.booked) {
      return NextResponse.json({ error: "Horário indisponível" }, { status: 400 });
    }

    let linkedPackageId: number | null = null;

    if (lessonType === "pacote_credito") {
      if (!studentPackageId) {
        return NextResponse.json({ error: "Pacote não informado" }, { status: 400 });
      }
      await useCredit(studentPackageId);
      linkedPackageId = studentPackageId;
    }

    if (lessonType === "pacote_novo") {
      if (!packageId) {
        return NextResponse.json({ error: "Pacote não informado" }, { status: 400 });
      }
      const purchased = await purchase(student.id, packageId);
      await useCredit(purchased.id);
      linkedPackageId = purchased.id;
    }

    await bookSlot(slot.id);

    await prisma.sessions.create({
      data: {
        organization_id: orgId,
        spot_id: slot.spot_id,
        student_id: student.id,
        instructor_id: slot.instructor_id,
        student_package_id: linkedPackageId,
        agenda_slot_id: slot.id,
        date: slot.agenda.date,
        start_time: slot.time,
        status: "scheduled",
        type: lessonType === "avulsa" ? "Aula avulsa" : "Pacote",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
