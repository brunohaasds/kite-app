import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { remove } from "@/domain/global-spots/repo";

const schema = z.object({ id: z.number().int() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await remove(parsed.data.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir spot" },
      { status: 500 },
    );
  }
}
