import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { purchase } from "@/domain/packages/repo";
import { z } from "zod";

const bodySchema = z.object({
  studentId: z.number().int().positive(),
  packageId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "studentId e packageId são obrigatórios" }, { status: 400 });
    }

    await purchase(parsed.data.studentId, parsed.data.packageId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro interno" },
      { status: 500 },
    );
  }
}
