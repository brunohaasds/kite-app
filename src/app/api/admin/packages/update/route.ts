import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { uuid, title, description, session_count, price, validity_days, active } = body;

    if (!uuid) {
      return NextResponse.json(
        { error: "uuid é obrigatório" },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId!;
    const existing = await prisma.packages.findFirst({
      where: { uuid, organization_id: orgId, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Pacote não encontrado" },
        { status: 404 },
      );
    }

    const pkg = await prisma.packages.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(session_count !== undefined && { session_count: Number(session_count) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(validity_days !== undefined && { validity_days: validity_days ? Number(validity_days) : null }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
