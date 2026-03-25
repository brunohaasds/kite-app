import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  paymentId: z.string().min(1),
  method: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "paymentId é obrigatório" }, { status: 400 });
    }

    const { paymentId, method } = parsed.data;
    const orgId = session.user.organizationId!;

    const existing = await prisma.payments.findFirst({
      where: { uuid: paymentId, organization_id: orgId, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    await prisma.payments.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        method: method || existing.method,
        paid_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
