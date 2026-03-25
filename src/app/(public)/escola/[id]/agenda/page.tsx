import { notFound } from "next/navigation";
import Link from "next/link";
import { getById } from "@/domain/organizations/repo";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "@/lib/icons";
import { MobileContainer } from "@/components/layout/mobile-container";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicAgendaPage({ params }: Props) {
  const { id } = await params;
  const orgId = Number(id);
  if (isNaN(orgId)) notFound();

  const org = await getById(orgId);
  if (!org) notFound();

  const agendas = await prisma.agendas.findMany({
    where: { organization_id: orgId, published: true, deleted_at: null },
    include: {
      slots: {
        where: { deleted_at: null },
        include: {
          spot: { select: { id: true, name: true } },
          instructor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { time: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  const allSlots = agendas.flatMap((a) =>
    a.slots.map((s) => ({
      agendaDate: a.date,
      dateLabel: a.date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      }),
      time: s.time,
      instructor: s.instructor?.user.name ?? "A definir",
      booked: s.booked,
      spotName: s.spot?.name ?? null,
      slotId: s.id,
    })),
  );

  return (
    <MobileContainer>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-card shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <Link href={`/escola/${orgId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Agenda</h1>
            <p className="text-sm text-muted-foreground">{org.name}</p>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-3 p-4">
        {allSlots.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum horário disponível no momento
          </div>
        )}

        {allSlots.map((slot, idx) => (
          <div key={idx} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground capitalize">
                  {slot.dateLabel}
                </p>
                <p className="text-2xl font-bold">{slot.time}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {slot.instructor}
                  {slot.spotName && ` • ${slot.spotName}`}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  slot.booked
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {slot.booked ? "Ocupado" : "Disponível"}
              </span>
            </div>

            {!slot.booked && (
              <Link href={`/escola/${orgId}/agendar/${slot.slotId}`}>
                <Button className="w-full">Agendar</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </MobileContainer>
  );
}
