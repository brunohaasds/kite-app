import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  phone: z.union([z.string().max(20), z.literal("")]).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { userId, name, phone } = parsed.data;
    if (userId === Number(session.user.id)) {
      return NextResponse.json(
        { error: "Use a página de conta para editar seu próprio perfil." },
        { status: 400 },
      );
    }

    const target = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await prisma.users.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined
          ? { phone: phone === "" ? null : phone }
          : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
