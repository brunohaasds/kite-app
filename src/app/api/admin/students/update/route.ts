import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const levelEnum = z.enum(["iniciante", "intermediario", "avancado"]);

const bodySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  level: levelEnum.optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    if (orgId == null) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 },
      );
    }

    const { uuid, name, phone, level } = parsed.data;

    if (name === undefined && phone === undefined && level === undefined) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 },
      );
    }

    const student = await prisma.students.findFirst({
      where: {
        uuid,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const member = await prisma.members.findFirst({
      where: {
        organization_id: orgId,
        user_id: student.user_id,
        deleted_at: null,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    if (name !== undefined || phone !== undefined) {
      await prisma.users.update({
        where: { id: student.user_id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone: phone === "" ? null : phone }),
        },
      });
    }

    if (level !== undefined) {
      await prisma.students.update({
        where: { id: student.id },
        data: { level },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
