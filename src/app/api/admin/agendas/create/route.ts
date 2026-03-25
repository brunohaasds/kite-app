import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

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

    const agenda = await prisma.agendas.create({
      data: {
        organization_id: orgId,
        slug,
        date: new Date(date),
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
    const message =
      err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
