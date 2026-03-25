import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  serviceId: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  sessionId: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Apenas alunos podem solicitar serviços" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { serviceId, notes, sessionId } = parsed.data;

    const student = await prisma.students.findFirst({
      where: { user_id: Number(session.user.id), deleted_at: null },
    });
    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const service = await prisma.services.findFirst({
      where: { id: serviceId, deleted_at: null, is_active: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    if (sessionId) {
      const lesson = await prisma.sessions.findFirst({
        where: {
          id: sessionId,
          student_id: student.id,
          deleted_at: null,
        },
      });
      if (!lesson) {
        return NextResponse.json(
          { error: "Aula não encontrada ou não pertence a você" },
          { status: 400 },
        );
      }
    }

    const booking = await prisma.service_bookings.create({
      data: {
        service_id: serviceId,
        student_id: student.id,
        session_id: sessionId ?? null,
        status: "requested",
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ id: booking.id, uuid: booking.uuid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
