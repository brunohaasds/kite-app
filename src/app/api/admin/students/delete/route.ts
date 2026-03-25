import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  uuid: z.string().uuid(),
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

    const student = await prisma.students.findFirst({
      where: {
        uuid: parsed.data.uuid,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.members.updateMany({
        where: {
          organization_id: orgId,
          user_id: student.user_id,
          deleted_at: null,
        },
        data: { deleted_at: now },
      }),
      prisma.students.update({
        where: { id: student.id },
        data: { deleted_at: now },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao excluir";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
