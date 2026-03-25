export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { findBySlug } from "@/domain/global-spots/repo";
import { listForGlobalSpot } from "@/domain/services/repo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PartnerServiceCard } from "@/components/services/partner-service-card";
import { MapPin, Globe, Shield, Store, Calendar, ArrowLeft, CheckCircle2, Star } from "@/lib/icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const spot = await findBySlug(slug);
  if (!spot) return { title: "Spot não encontrado" };
  return { title: spot.name };
}

export default async function SpotPage({ params }: Props) {
  const { slug } = await params;
  const spot = await findBySlug(slug);
  if (!spot) notFound();

  const partners = await listForGlobalSpot(spot.id);
  const sessionAuth = await auth();
  const canRequestPartner = sessionAuth?.user?.role === "student";

  const linkedOrgIds = spot.spots.map((s) => s.organization.id);
  const permOrgIds = spot.permissions.map((p) => p.organization.id);
  const ownerOrgId = spot.owner_organization?.id;

  const allOrgIds = new Set([...linkedOrgIds, ...permOrgIds]);
  if (ownerOrgId) allOrgIds.add(ownerOrgId);

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingSlots = allOrgIds.size > 0
    ? await prisma.agenda_slots.findMany({
        where: {
          deleted_at: null,
          booked: false,
          agenda: {
            deleted_at: null,
            published: true,
            organization_id: { in: Array.from(allOrgIds) },
            date: { gte: tomorrow, lte: nextWeek },
          },
        },
        include: {
          agenda: {
            select: {
              date: true,
              day_name: true,
              organization: { select: { id: true, name: true } },
            },
          },
          instructor: {
            select: { user: { select: { name: true } } },
          },
        },
        orderBy: [
          { agenda: { date: "asc" } },
          { time: "asc" },
        ],
        take: 10,
      })
    : [];

  const tips = (spot.tips as string[] | null) ?? [];
  const services = (spot.services as string[] | null) ?? [];

  const allOrgs = [
    ...(spot.owner_organization
      ? [
          {
            id: spot.owner_organization.id,
            name: spot.owner_organization.name,
            avatar: spot.owner_organization.avatar,
            description: null as string | null,
            isOwner: true,
          },
        ]
      : []),
    ...spot.spots
      .filter((s) => s.organization.id !== ownerOrgId)
      .map((s) => ({
        id: s.organization.id,
        name: s.organization.name,
        avatar: s.organization.avatar,
        description: s.organization.description,
        isOwner: false,
      })),
    ...spot.permissions
      .filter(
        (p) =>
          p.organization.id !== ownerOrgId &&
          !linkedOrgIds.includes(p.organization.id),
      )
      .map((p) => ({
        id: p.organization.id,
        name: p.organization.name,
        avatar: p.organization.avatar,
        description: p.organization.description,
        isOwner: false,
      })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative">
        {spot.image ? (
          <div className="h-56 sm:h-72 w-full overflow-hidden">
            <img
              src={spot.image}
              alt={spot.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-56 sm:h-72 w-full bg-gradient-to-br from-primary to-primary/70" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{spot.name}</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                spot.access === "public"
                  ? "bg-green-500/20 text-green-100"
                  : "bg-amber-500/20 text-amber-100"
              }`}
            >
              {spot.access === "public" ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
              {spot.access === "public" ? "Público" : "Privado"}
            </span>
          </div>
          {spot.parent_spot && (
            <p className="text-sm opacity-80">
              Dentro de{" "}
              <Link
                href={`/spot/${spot.parent_spot.slug}`}
                className="underline"
              >
                {spot.parent_spot.name}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
        {/* Description */}
        {spot.description && (
          <section>
            <p className="text-muted-foreground leading-relaxed">
              {spot.description}
            </p>
          </section>
        )}

        {/* Services & Tips */}
        {(services.length > 0 || tips.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.length > 0 && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Serviços
                </h3>
                <ul className="space-y-1.5">
                  {services.map((svc, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                      {svc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tips.length > 0 && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Dicas
                </h3>
                <ul className="space-y-1.5">
                  {tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sub-spots */}
        {spot.children.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Bases neste spot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {spot.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/spot/${child.slug}`}
                  className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-medium">{child.name}</span>
                      {child.owner_organization && (
                        <p className="text-xs text-muted-foreground">
                          {child.owner_organization.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Partner services (global spot scope) */}
        {partners.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Parceiros neste spot</h2>
            <p className="text-sm text-muted-foreground">
              Prestadores vinculados a esta praia — entre em contato ou solicite pelo app (conta de
              aluno).
            </p>
            <div className="space-y-3">
              {partners.map((p) => (
                <PartnerServiceCard
                  key={p.id}
                  service={p}
                  canRequest={canRequestPartner}
                />
              ))}
            </div>
          </section>
        )}

        {/* Schools */}
        {allOrgs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Escolas neste spot</h2>
            <div className="space-y-3">
              {allOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/escola/${org.id}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 overflow-hidden">
                    {org.avatar ? (
                      <img
                        src={org.avatar}
                        alt={org.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{org.name}</span>
                    {org.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {org.description}
                      </p>
                    )}
                  </div>
                  {org.isOwner && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 shrink-0">
                      Dono
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Lessons */}
        {upcomingSlots.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Próximas aulas</h2>
            <div className="space-y-2">
              {upcomingSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {slot.agenda.day_name} · {slot.time}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {slot.agenda.organization.name}
                      {slot.instructor &&
                        ` · ${slot.instructor.user.name}`}
                    </p>
                  </div>
                  <Link
                    href={`/escola/${slot.agenda.organization.id}`}
                    className="text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    Agendar
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
