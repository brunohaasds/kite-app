import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isProfileComplete } from "@/domain/users/profile";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { id: Number(session.user.id), deleted_at: null },
      select: {
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const complete = isProfileComplete(user);
    const missing: string[] = [];
    if (!complete) {
      if (user.name.trim().length < 2) missing.push("name");
      else if (user.name.trim().toLowerCase() === "aluno") missing.push("name");
      const digits = (user.phone ?? "").replace(/\D/g, "");
      if (digits.length < 10) missing.push("phone");
    }

    return NextResponse.json({
      complete,
      missingFields: missing,
      role: user.role,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
