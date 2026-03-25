import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { create } from "@/domain/instructors/repo";
import { createInstructorSchema } from "@/domain/instructors/schema";
import { prisma } from "@/lib/db";

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
    const parsed = createInstructorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const existing = await prisma.users.findFirst({
      where: { email: parsed.data.email, deleted_at: null },
    });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const instructor = await create(orgId, parsed.data);
    return NextResponse.json({ instructor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar instrutor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
