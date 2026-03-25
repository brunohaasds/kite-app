import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { create } from "@/domain/spots/repo";
import { createSpotSchema } from "@/domain/spots/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organização não encontrada" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createSpotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const spot = await create(orgId, parsed.data);
    return NextResponse.json({ spot });
  } catch {
    return NextResponse.json({ error: "Erro ao criar spot" }, { status: 500 });
  }
}
