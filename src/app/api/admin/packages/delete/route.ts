import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { uuid } = await request.json();
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

    await prisma.packages.update({
      where: { id: existing.id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
