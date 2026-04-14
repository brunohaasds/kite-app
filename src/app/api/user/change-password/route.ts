import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "@/domain/users/schema";
import { changePasswordForAuthenticatedUser } from "@/domain/users/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const { currentPassword, newPassword } = parsed.data;

    const result = await changePasswordForAuthenticatedUser(
      userId,
      currentPassword,
      newPassword,
    );

    if (!result.ok) {
      if (result.code === "user_not_found") {
        return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
