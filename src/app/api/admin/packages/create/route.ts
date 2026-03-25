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
    const { title, description, session_count, price, validity_days } = body;

    if (!title || !session_count || price == null) {
      return NextResponse.json(
        { error: "title, session_count e price são obrigatórios" },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId!;

    const pkg = await prisma.packages.create({
      data: {
        organization_id: orgId,
        title,
        description: description || null,
        session_count: Number(session_count),
        price: Number(price),
        validity_days: validity_days ? Number(validity_days) : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
