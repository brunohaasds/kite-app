import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publicBookingBodySchema } from "@/domain/agendas/schema";
import { bookSlotInTransaction } from "@/domain/agendas/repo";
import { purchaseInTransaction, useCreditInTransaction } from "@/domain/packages/repo";
import {
  ensureStudentForOrganization,
  StudentOrgConflictError,
} from "@/domain/students/ensure";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = publicBookingBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { slotId, orgId, lessonType, studentPackageId, packageId } = parsed.data;
    const userId = Number(session.user.id);

    const slot = await prisma.agenda_slots.findUnique({
      where: { id: slotId },
      include: { agenda: { select: { date: true, organization_id: true } } },
    });

    if (!slot || slot.booked) {
      return NextResponse.json({ error: "Horário indisponível" }, { status: 400 });
    }

    if (slot.agenda.organization_id !== orgId) {
      return NextResponse.json({ error: "Horário inválido para esta escola" }, { status: 400 });
    }

    if (lessonType === "pacote_credito" && !studentPackageId) {
      return NextResponse.json({ error: "Pacote não informado" }, { status: 400 });
    }
    if (lessonType === "pacote_novo" && !packageId) {
      return NextResponse.json({ error: "Pacote não informado" }, { status: 400 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const student = await ensureStudentForOrganization(tx, userId, orgId);

      let linkedPackageId: number | null = null;

      if (lessonType === "pacote_credito" && studentPackageId) {
        await useCreditInTransaction(tx, studentPackageId);
        linkedPackageId = studentPackageId;
      }

      if (lessonType === "pacote_novo" && packageId) {
        const purchased = await purchaseInTransaction(tx, student.id, packageId);
        await useCreditInTransaction(tx, purchased.id);
        linkedPackageId = purchased.id;
      }

      await bookSlotInTransaction(tx, slot.id);

      await tx.sessions.create({
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
          booking_source: "student",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof StudentOrgConflictError) {
      return NextResponse.json(
        {
          error:
            "A sua conta já está vinculada a outra escola. Use essa escola para agendar ou contacte o suporte.",
        },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
