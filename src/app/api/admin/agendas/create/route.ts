import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

/** Persiste YYYY-MM-DD como data de calendário estável (UTC date-only). */
function calendarDateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const bodySchema = z.object({
  date: z.string().min(1),
  dayName: z.string().min(1),
  slots: z
    .array(
      z.object({
        time: z.string().min(1),
        instructorId: z.number().nullable(),
        spotId: z.number().nullable().optional(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "date, dayName e slots são obrigatórios" },
        { status: 400 },
      );
    }

    const { date, dayName, slots } = parsed.data;

    const orgId = session.user.organizationId!;
    const slug = `${date}-${orgId}`;

    const existing = await prisma.agendas.findFirst({
      where: {
        organization_id: orgId,
        slug,
        deleted_at: null,
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma agenda para esta data. Exclua a anterior ou escolha outra data." },
        { status: 409 },
      );
    }

    const softDeleted = await prisma.agendas.findFirst({
      where: {
        organization_id: orgId,
        slug,
        deleted_at: { not: null },
      },
    });
    if (softDeleted) {
      await prisma.agendas.update({
        where: { id: softDeleted.id },
        data: {
          slug: `${slug}-excluida-${softDeleted.id}-${Date.now()}`,
        },
      });
    }

    const agenda = await prisma.agendas.create({
      data: {
        organization_id: orgId,
        slug,
        date: calendarDateFromYmd(date),
        day_name: dayName,
        published: true,
        slots: {
          create: slots.map((s) => ({
            time: s.time,
            instructor_id: s.instructorId || null,
            spot_id: s.spotId || null,
          })),
        },
      },
      include: { slots: true },
    });

    return NextResponse.json({ success: true, agenda });
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      return NextResponse.json(
        {
          error:
            "Já existe uma agenda para esta data. Exclua a anterior ou escolha outra data.",
        },
        { status: 409 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
