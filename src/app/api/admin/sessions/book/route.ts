import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bookSlot } from "@/domain/agendas/repo";
import { useCredit, purchase } from "@/domain/packages/repo";

const bodySchema = z.object({
  slotId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  lessonType: z.enum(["avulsa", "pacote_credito", "pacote_novo"]),
  studentPackageId: z.number().int().positive().optional(),
  packageId: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orgId = session.user.organizationId!;
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { slotId, studentId, lessonType, studentPackageId, packageId } =
      parsed.data;

    const student = await prisma.students.findFirst({
      where: { id: studentId, organization_id: orgId, deleted_at: null },
    });
    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const slot = await prisma.agenda_slots.findFirst({
      where: { id: slotId, deleted_at: null },
      include: {
        agenda: {
          select: {
            id: true,
            date: true,
            organization_id: true,
            deleted_at: true,
          },
        },
      },
    });

    if (
      !slot ||
      slot.agenda.deleted_at ||
      slot.agenda.organization_id !== orgId
    ) {
      return NextResponse.json(
        { error: "Horário inválido ou indisponível" },
        { status: 400 },
      );
    }

    if (slot.booked) {
      return NextResponse.json(
        { error: "Este horário já está ocupado" },
        { status: 400 },
      );
    }

    let linkedPackageId: number | null = null;

    if (lessonType === "pacote_credito") {
      if (!studentPackageId) {
        return NextResponse.json(
          { error: "Selecione um pacote com crédito" },
          { status: 400 },
        );
      }
      const sp = await prisma.student_packages.findFirst({
        where: {
          id: studentPackageId,
          student_id: studentId,
          deleted_at: null,
        },
        include: { package: true },
      });
      if (!sp || sp.package.organization_id !== orgId) {
        return NextResponse.json(
          { error: "Pacote do aluno inválido" },
          { status: 400 },
        );
      }
      await useCredit(studentPackageId);
      linkedPackageId = studentPackageId;
    }

    if (lessonType === "pacote_novo") {
      if (!packageId) {
        return NextResponse.json(
          { error: "Selecione um pacote" },
          { status: 400 },
        );
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
        booking_source: "admin",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
