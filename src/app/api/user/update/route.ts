import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { isProfileComplete } from "@/domain/users/profile";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional(),
  level: z.enum(["iniciante", "intermediario", "avancado"]).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const { level, ...userFields } = parsed.data;

    const before = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      select: { name: true, phone: true, profile_completed_at: true },
    });
    if (!before) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const nextName = userFields.name ?? before.name;
    const nextPhone = userFields.phone !== undefined ? userFields.phone : before.phone;
    const profileComplete = isProfileComplete({ name: nextName, phone: nextPhone });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.users.update({
        where: { id: userId },
        data: {
          ...(userFields.name !== undefined && { name: userFields.name }),
          ...(userFields.phone !== undefined && { phone: userFields.phone }),
          ...(userFields.avatar !== undefined && { avatar: userFields.avatar }),
          profile_completed_at: profileComplete
            ? (before.profile_completed_at ?? new Date())
            : null,
        },
      });

      if (level !== undefined && session.user.role === "student") {
        const student = await tx.students.findFirst({
          where: { user_id: userId, deleted_at: null },
        });
        if (student) {
          await tx.students.update({
            where: { id: student.id },
            data: { level },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
