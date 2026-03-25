import { notFound } from "next/navigation";
import { getBySlug } from "@/domain/agendas/repo";
import { requireAuth } from "@/lib/rbac/require-permission";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Calendar, MapPin } from "@/lib/icons";
import { SharedAgendaClient } from "./shared-agenda-client";

interface Props {
  params: Promise<{ agendaId: string }>;
}

export default async function SharedAgendaPage({ params }: Props) {
  const { agendaId } = await params;
  await requireAuth();

  const agenda = await getBySlug(agendaId);
  if (!agenda) notFound();

  const slotsData = agenda.slots.map((s) => ({
    id: s.id,
    time: s.time,
    booked: s.booked,
    instructor: s.instructor?.user.name ?? null,
    spotName: s.spot?.name ?? null,
  }));

  return (
    <MobileContainer>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Agenda do dia</h1>
        <p className="text-sm text-muted-foreground">{agenda.day_name}</p>
      </div>

      <div className="space-y-6 p-4 pb-24">
        {/* Agenda info */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold">
                  {agenda.date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="font-semibold">
                  {agenda.slots[0]?.spot?.name ?? "A definir"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slots (client component for interactivity) */}
        <SharedAgendaClient
          slots={slotsData}
          rules={(agenda.rules as string[]) ?? []}
        />

        {/* Legend */}
        <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-semibold">Legenda:</p>
          <p>Verde = Disponível | Cinza = Ocupado</p>
        </div>
      </div>
    </MobileContainer>
  );
}
