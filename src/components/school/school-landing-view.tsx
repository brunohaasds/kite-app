import Link from "next/link";
import { PartnerServiceCard } from "@/components/services/partner-service-card";
import { Button } from "@/components/ui/button";
import { Clock, Wind, Backpack, Star, Globe, ExternalLink, ChevronRight } from "@/lib/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { pickSchoolHeroFallback } from "@/lib/school-hero-fallbacks";
import { SchoolHeroImage } from "@/components/school/school-hero-image";
import type { SchoolLandingPayload } from "./school-landing-data";

type Props = {
  data: SchoolLandingPayload;
  topSlot?: React.ReactNode;
};

export function SchoolLandingView({ data, topSlot }: Props) {
  const { org, spots, instructors, partners, canRequestPartner, upcomingSlots } = data;
  const heroSrc = org.hero_image ?? pickSchoolHeroFallback(org.id);

  return (
    <>
      {topSlot}
      {/* Hero — imagem da escola ou fallback em public/hero/ */}
      <div className="relative h-[35vh] min-h-[280px] overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 md:min-h-[min(45vh,440px)] md:rounded-xl md:shadow-sm">
        <SchoolHeroImage src={heroSrc} alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8 lg:max-w-3xl">
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
            <Link href={`/escola/${org.slug}/agenda`}>
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
      <div
        className={
          upcomingSlots.length > 0
            ? "space-y-4 p-4 md:space-y-8 md:py-6 md:pb-10 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8 lg:space-y-0"
            : "space-y-4 p-4 md:space-y-8 md:py-6 md:pb-10"
        }
      >
        <div
          className={
            upcomingSlots.length > 0
              ? "space-y-4 md:space-y-8 lg:col-span-2"
              : "space-y-4 md:space-y-8"
          }
        >
        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none">
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
          <div className="rounded-xl border bg-card p-4 shadow-sm md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none">
            <h2 className="mb-2 text-xl font-bold">Sobre a escola</h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{org.description}</p>
          </div>
        )}

        {/* Instructors */}
        {instructors.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-bold">Instrutores</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {instructors.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/escola/${org.slug}/instrutor/${inst.id}`}
                  className="block rounded-xl border bg-card p-4 shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar name={inst.user.name} imageUrl={inst.avatar} size="lg" />
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
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
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

        {/* Parceiros — ao final da página */}
        {partners.length > 0 && (
          <div className="pb-6">
            <h2 className="mb-3 text-xl font-bold">Parceiros</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {partners.map((p: (typeof partners)[number]) => (
                <PartnerServiceCard
                  key={p.id}
                  service={p}
                  canRequest={canRequestPartner}
                />
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Upcoming slots — coluna lateral em desktop */}
        {upcomingSlots.length > 0 && (
          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Próximos horários</h2>
              <Link href={`/escola/${org.slug}/agenda`}>
                <Button variant="ghost" size="sm" className="shrink-0 text-primary">
                  Ver agenda
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingSlots.slice(0, 4).map((slot, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
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
                  <span className="w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-400">
                    Disponível
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
