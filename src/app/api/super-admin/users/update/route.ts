import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { updateUserBySuperAdmin } from "@/domain/users/service";

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
    const actorId = Number(session.user.id);

    await updateUserBySuperAdmin(userId, actorId, {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    const status =
      message.includes("próprio perfil") || message.includes("não encontrado")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
