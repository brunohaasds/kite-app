import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listStudentPackages } from "@/domain/packages/repo";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const student = await prisma.students.findFirst({
      where: { user_id: Number(session.user.id), deleted_at: null },
    });

    if (!student) {
      return NextResponse.json({ packages: [] });
    }

    const all = await listStudentPackages(student.id);
    const active = all.filter(
      (sp) => sp.status === "active" && sp.sessions_remaining > 0,
    );

    return NextResponse.json({ packages: active });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
