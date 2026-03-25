import { notFound } from "next/navigation";
import Link from "next/link";
import { getById as getOrg } from "@/domain/organizations/repo";
import { getById as getInstructor } from "@/domain/instructors/repo";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileContainer } from "@/components/layout/mobile-container";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ArrowLeft, Award, Clock, MessageCircle } from "@/lib/icons";
import { whatsappLink } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string; instructorId: string }>;
}

export default async function InstructorPublicPage({ params }: Props) {
  const { id, instructorId } = await params;
  const orgId = Number(id);
  const instId = Number(instructorId);
  if (isNaN(orgId) || isNaN(instId)) notFound();

  const [org, instructor] = await Promise.all([
    getOrg(orgId),
    getInstructor(instId),
  ]);

  if (!org || !instructor || instructor.organization_id !== orgId) notFound();

  const slots = await prisma.agenda_slots.findMany({
    where: {
      instructor_id: instId,
      booked: false,
      deleted_at: null,
      agenda: {
        published: true,
        deleted_at: null,
        date: { gte: new Date() },
      },
    },
    include: {
      agenda: { select: { date: true, day_name: true } },
      spot: { select: { name: true } },
    },
    orderBy: [
      { agenda: { date: "asc" } },
      { time: "asc" },
    ],
    take: 20,
  });

  const upcomingSlots = slots.map((s) => ({
    id: s.id,
    time: s.time,
    date: s.agenda.date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
    dayName: s.agenda.day_name,
    spotName: s.spot?.name ?? null,
  }));

  const certifications = instructor.extras?.certifications ?? [];

  return (
    <MobileContainer>
      {/* Header with avatar */}
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
        <Link href={`/escola/${orgId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="mb-4 text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex flex-col items-center text-center">
          <UserAvatar
            name={instructor.name}
            imageUrl={instructor.avatar}
            size="xl"
            className="mb-4 border-4 border-white/20"
          />
          <h1 className="text-2xl font-bold">{instructor.name}</h1>
          <p className="text-sm opacity-90">{org.name}</p>
          {instructor.experience_years && (
            <p className="text-sm opacity-75 mt-1">
              {instructor.experience_years} anos de experiência
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Bio */}
        {instructor.bio && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold">Sobre</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {instructor.bio}
            </p>
          </div>
        )}

        {/* Certifications */}
        {(certifications.length > 0 || instructor.certification) && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certificações
            </h2>
            <div className="flex flex-wrap gap-2">
              {instructor.certification && (
                <Badge className="bg-primary/10 text-primary">
                  {instructor.certification}
                </Badge>
              )}
              {certifications.map((cert) => (
                <Badge key={cert} variant="secondary">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {upcomingSlots.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-bold">Próximos Horários</h2>
            <div className="space-y-2">
              {upcomingSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground capitalize">
                        {slot.date}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {slot.time}
                      </p>
                      {slot.spotName && (
                        <p className="text-xs text-muted-foreground">
                          {slot.spotName}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href={`/escola/${orgId}/agendar/${slot.id}`}>
                    <Button size="sm">Agendar</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingSlots.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sem horários disponíveis no momento
            </p>
          </div>
        )}

        {/* WhatsApp */}
        {instructor.phone && (
          <div className="pb-4">
            <a
              href={whatsappLink(
                instructor.phone,
                `Olá ${instructor.name}, gostaria de agendar uma aula!`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full gap-2">
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
