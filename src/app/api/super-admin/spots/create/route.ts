import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGlobalSpotSchema } from "@/domain/global-spots/schema";
import { create } from "@/domain/global-spots/repo";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createGlobalSpotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const spot = await create(parsed.data);
    return NextResponse.json(spot);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao criar spot";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Slug já está em uso" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
