import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { update } from "@/domain/instructors/repo";
import { updateInstructorSchema } from "@/domain/instructors/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    const isAdmin = session.user.role === "admin";
    if (!isAdmin) {
      if (session.user.role !== "instructor") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const row = await prisma.instructors.findFirst({
        where: { id, deleted_at: null },
        select: { user_id: true },
      });
      if (!row || row.user_id !== Number(session.user.id)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const parsed = updateInstructorSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const instructor = await update(id, parsed.data);
    return NextResponse.json({ instructor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
