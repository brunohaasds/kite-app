import { notFound } from "next/navigation";
import Link from "next/link";
import { getById } from "@/domain/organizations/repo";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Clock, Wind, Backpack, Star, Globe, ExternalLink } from "@/lib/icons";
import { MobileContainer } from "@/components/layout/mobile-container";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SchoolLandingPage({ params }: Props) {
  const { id } = await params;
  const orgId = Number(id);
  if (isNaN(orgId)) notFound();

  const org = await getById(orgId);
  if (!org) notFound();

  const spots = await prisma.spots.findMany({
    where: { organization_id: orgId, deleted_at: null },
  });

  const instructors = await prisma.instructors.findMany({
    where: { organization_id: orgId, deleted_at: null },
    include: { user: { select: { name: true } } },
  });

  const agendas = await prisma.agendas.findMany({
    where: { organization_id: orgId, published: true, deleted_at: null },
    include: {
      slots: {
        where: { booked: false, deleted_at: null },
        include: { instructor: { include: { user: { select: { name: true } } } } },
        take: 4,
        orderBy: { time: "asc" },
      },
    },
    orderBy: { date: "asc" },
    take: 2,
  });

  const upcomingSlots = agendas.flatMap((a) =>
    a.slots.map((s) => ({
      day: a.day_name.slice(0, 3),
      date: a.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      time: s.time,
      instructor: s.instructor?.user.name ?? "A definir",
      slotId: s.id,
    })),
  );

  return (
    <MobileContainer>
      {/* Hero */}
      <div className="relative h-[35vh] min-h-[280px] overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="mb-1 text-3xl font-bold">{org.name}</h1>
          <p className="mb-3 text-sm opacity-90">
            {spots.length > 0 ? spots.map((s) => s.name).join(", ") : "Kitesurf"}
          </p>

          <div className="mb-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-1 text-sm">4.9</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Link href={`/escola/${orgId}/agenda`}>
              <Button size="lg" className="flex-1 shadow-lg">
                Agendar aula
              </Button>
            </Link>
            {org.whatsapp && (
              <a
                href={`https://wa.me/${org.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
            <Clock className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-xs text-muted-foreground">Duração</p>
            <p className="text-sm font-semibold">2h</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
            <Wind className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-xs text-muted-foreground">Vento</p>
            <p className="text-sm font-semibold">Depende</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
            <Backpack className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-xs text-muted-foreground">Equipamento</p>
            <p className="text-sm font-semibold">Incluso</p>
          </div>
        </div>

        {/* About */}
        {org.description && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-2 text-xl font-bold">Sobre a escola</h2>
            <p className="text-sm text-muted-foreground">{org.description}</p>
          </div>
        )}

        {/* Instructors */}
        {instructors.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-bold">Instrutores</h2>
            <div className="space-y-3">
              {instructors.map((inst) => (
                <div key={inst.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {inst.user.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{inst.user.name}</h3>
                      {inst.certification && (
                        <p className="text-sm text-muted-foreground">
                          Certificação {inst.certification}
                        </p>
                      )}
                      {inst.experience_years && (
                        <p className="text-sm text-muted-foreground">
                          {inst.experience_years} anos de experiência
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming slots */}
        {upcomingSlots.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Próximos horários</h2>
              <Link href={`/escola/${orgId}/agenda`}>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver agenda
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingSlots.slice(0, 4).map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{slot.day}</p>
                      <p className="font-semibold">{slot.date}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{slot.time}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.instructor}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Disponível
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="space-y-3 border-t pt-4 pb-6">
          {org.site && (
            <a
              href={org.site}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Site oficial da escola
            </a>
          )}
          {org.instagram && (
            <a
              href={`https://instagram.com/${org.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              @{org.instagram}
            </a>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
