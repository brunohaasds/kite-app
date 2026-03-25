import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { remove } from "@/domain/spots/repo";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    await remove(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover spot" }, { status: 500 });
  }
}
