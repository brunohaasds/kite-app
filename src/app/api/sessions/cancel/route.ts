import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancel } from "@/domain/sessions/repo";
import { z } from "zod";

const bodySchema = z.object({
  sessionId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "sessionId é obrigatório" }, { status: 400 });
    }

    await cancel(parsed.data.sessionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
