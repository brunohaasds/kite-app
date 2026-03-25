import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateGlobalSpotSchema } from "@/domain/global-spots/schema";
import { update } from "@/domain/global-spots/repo";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateGlobalSpotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...data } = parsed.data;
  try {
    const spot = await update(id, data);
    return NextResponse.json(spot);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao atualizar spot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
