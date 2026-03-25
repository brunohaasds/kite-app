import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findServiceByUserId } from "@/domain/services/repo";

const patchSchema = z.object({
  status: z.enum(["confirmed", "cancelled"]),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "service_provider") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await context.params;
    const bookingId = Number(id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const service = await findServiceByUserId(Number(session.user.id));
    if (!service) {
      return NextResponse.json({ error: "Perfil de prestador não encontrado" }, { status: 404 });
    }

    const booking = await prisma.service_bookings.findFirst({
      where: {
        id: bookingId,
        service_id: service.id,
        deleted_at: null,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (booking.status !== "requested") {
      return NextResponse.json(
        { error: "Este pedido já foi respondido" },
        { status: 400 },
      );
    }

    await prisma.service_bookings.update({
      where: { id: bookingId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
