import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listByOrg, listStudentPackages } from "@/domain/packages/repo";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orgId = session.user.organizationId!;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId é obrigatório" },
        { status: 400 },
      );
    }

    const sid = parseInt(studentId, 10);
    if (Number.isNaN(sid)) {
      return NextResponse.json({ error: "studentId inválido" }, { status: 400 });
    }

    const student = await prisma.students.findFirst({
      where: { id: sid, organization_id: orgId, deleted_at: null },
    });
    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const [studentPackages, shopPackages] = await Promise.all([
      listStudentPackages(sid),
      listByOrg(orgId),
    ]);

    const packagesWithCredit = studentPackages.filter(
      (p) => p.status === "active" && p.sessions_remaining > 0,
    );

    return NextResponse.json({
      studentPackages: packagesWithCredit.map((p) => ({
        id: p.id,
        title: p.package.title,
        sessionsRemaining: p.sessions_remaining,
      })),
      shopPackages: shopPackages
        .filter((p) => p.active)
        .map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          sessionCount: p.session_count,
        })),
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
