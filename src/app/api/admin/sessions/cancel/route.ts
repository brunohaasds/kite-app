import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { sessionId, reason } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId é obrigatório" },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId;
    const existing = await prisma.sessions.findFirst({
      where: {
        uuid: sessionId,
        organization_id: orgId!,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 },
      );
    }

    const status =
      reason === "weather"
        ? "cancelled_weather"
        : reason === "student"
          ? "cancelled_student"
          : "cancelled";

    await prisma.sessions.update({
      where: { id: existing.id },
      data: { status, updated_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
