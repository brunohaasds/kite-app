import { notFound } from "next/navigation";
import Link from "next/link";
import { findBySlug } from "@/domain/global-spots/repo";
import { listForGlobalSpot } from "@/domain/services/repo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PartnerServiceCard } from "@/components/services/partner-service-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  MapPin,
  Globe,
  Shield,
  Store,
  ArrowLeft,
  CheckCircle2,
  Star,
  ChevronRight,
} from "@/lib/icons";

type GlobalSpot = NonNullable<Awaited<ReturnType<typeof findBySlug>>>;

type Props = {
  slug: string;
  /** ex.: "" (público) ou "/aluno" (app com shell) */
  pathPrefix?: string;
  backHref?: string;
};

export async function SpotDetailPage({
  slug,
  pathPrefix = "",
  backHref = "/spots",
}: Props) {
  const spot = await findBySlug(slug);
  if (!spot) notFound();

  const partners = await listForGlobalSpot(spot.id);
  const sessionAuth = await auth();
  const canRequestPartner = sessionAuth?.user?.role === "student";

  const linkedOrgIds = spot.spots.map((s: GlobalSpot["spots"][number]) => s.organization.id);
  const permOrgIds = spot.permissions.map(
    (p: GlobalSpot["permissions"][number]) => p.organization.id,
  );
  const ownerOrgId = spot.owner_organization?.id;

  const allOrgIds = new Set([...linkedOrgIds, ...permOrgIds]);
  if (ownerOrgId) allOrgIds.add(ownerOrgId);

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingSlots =
    allOrgIds.size > 0
      ? await prisma.agenda_slots.findMany({
          where: {
            deleted_at: null,
            booked: false,
            instructor_id: { not: null },
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
                organization: { select: { id: true, name: true, slug: true } },
              },
            },
            instructor: {
              select: {
                id: true,
                avatar: true,
                user: { select: { name: true } },
              },
            },
          },
          orderBy: [{ agenda: { date: "asc" } }, { time: "asc" }],
          take: 48,
        })
      : [];

  type UpcomingSlot = (typeof upcomingSlots)[number];

  const instructorScheduleGroups = (() => {
    const map = new Map<
      number,
      {
        instructorId: number;
        name: string;
        avatar: string | null;
        orgSlug: string;
        orgName: string;
        slots: UpcomingSlot[];
      }
    >();
    for (const slot of upcomingSlots) {
      if (!slot.instructor_id || !slot.instructor) continue;
      const id = slot.instructor_id;
      const cur = map.get(id);
      if (cur) {
        cur.slots.push(slot);
      } else {
        map.set(id, {
          instructorId: id,
          name: slot.instructor.user.name,
          avatar: slot.instructor.avatar,
          orgSlug: slot.agenda.organization.slug,
          orgName: slot.agenda.organization.name,
          slots: [slot],
        });
      }
    }
    for (const g of map.values()) {
      g.slots.sort((a, b) => {
        const t = a.agenda.date.getTime() - b.agenda.date.getTime();
        return t !== 0 ? t : a.time.localeCompare(b.time);
      });
    }
    return Array.from(map.values()).sort((a, b) => {
      const ta = a.slots[0]?.agenda.date.getTime() ?? 0;
      const tb = b.slots[0]?.agenda.date.getTime() ?? 0;
      return ta - tb;
    });
  })();

  function formatSlotLabel(slot: UpcomingSlot) {
    const dayShort =
      slot.agenda.day_name.split("-")[0]?.trim() ?? slot.agenda.day_name;
    return `${dayShort} · ${slot.time}`;
  }

  const tips = (spot.tips as string[] | null) ?? [];
  const services = (spot.services as string[] | null) ?? [];

  const allOrgs = [
    ...(spot.owner_organization
      ? [
          {
            id: spot.owner_organization.id,
            slug: spot.owner_organization.slug,
            name: spot.owner_organization.name,
            avatar: spot.owner_organization.avatar,
            description: null as string | null,
            isOwner: true,
          },
        ]
      : []),
    ...spot.spots
      .filter((s: GlobalSpot["spots"][number]) => s.organization.id !== ownerOrgId)
      .map((s: GlobalSpot["spots"][number]) => ({
        id: s.organization.id,
        slug: s.organization.slug,
        name: s.organization.name,
        avatar: s.organization.avatar,
        description: s.organization.description,
        isOwner: false,
      })),
    ...spot.permissions
      .filter(
        (p: GlobalSpot["permissions"][number]) =>
          p.organization.id !== ownerOrgId &&
          !linkedOrgIds.includes(p.organization.id),
      )
      .map((p: GlobalSpot["permissions"][number]) => ({
        id: p.organization.id,
        slug: p.organization.slug,
        name: p.organization.name,
        avatar: p.organization.avatar,
        description: p.organization.description,
        isOwner: false,
      })),
  ];

  const p = pathPrefix;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[35vh] min-h-[280px] overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10">
        {spot.image ? (
          <img
            src={spot.image}
            alt={spot.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <Link
          href={backHref}
          className="absolute left-6 top-6 z-10 inline-flex items-center gap-1 text-sm text-white/90 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white">
          <h1 className="mb-1 text-3xl font-bold">{spot.name}</h1>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                spot.access === "public"
                  ? "bg-green-500/25 text-green-100"
                  : "bg-amber-500/25 text-amber-100"
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
            <p className="text-sm opacity-90">
              Dentro de{" "}
              <Link
                href={`${p}/spot/${spot.parent_spot.slug}`}
                className="underline underline-offset-2"
              >
                {spot.parent_spot.name}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-10 pt-2 sm:space-y-8 md:px-6 lg:px-8">
        {spot.description && (
          <section className="max-w-3xl">
            <p className="leading-relaxed text-muted-foreground md:text-lg">
              {spot.description}
            </p>
          </section>
        )}

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
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
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
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {spot.children.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Bases neste spot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {spot.children.map((child: GlobalSpot["children"][number]) => (
                <Link
                  key={child.id}
                  href={`${p}/spot/${child.slug}`}
                  className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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

        {allOrgs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Escolas neste spot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {allOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`${p}/spot/${slug}/escola/${org.slug}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
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
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{org.name}</span>
                    {org.description && (
                      <p className="truncate text-sm text-muted-foreground">
                        {org.description}
                      </p>
                    )}
                  </div>
                  {org.isOwner && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Dono
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {instructorScheduleGroups.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Instrutores</h2>
              <p className="text-sm text-muted-foreground">
                Horários disponíveis nas escolas deste spot (próximos dias)
              </p>
            </div>
            <div className="space-y-3">
              {instructorScheduleGroups.map((group) => {
                const shown = group.slots.slice(0, 5);
                const more = group.slots.length - shown.length;
                const profileHref = `/escola/${group.orgSlug}/instrutor/${group.instructorId}`;
                return (
                  <div
                    key={group.instructorId}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <UserAvatar
                        name={group.name}
                        imageUrl={group.avatar}
                        size="lg"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.orgName}</p>
                        <p className="mt-2 text-sm leading-relaxed">
                          {shown.map((slot, i) => (
                            <span key={slot.id}>
                              {i > 0 ? (
                                <span className="text-muted-foreground"> · </span>
                              ) : null}
                              <span className="font-medium text-foreground">
                                {formatSlotLabel(slot)}
                              </span>
                            </span>
                          ))}
                          {more > 0 ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · +{more} horário{more > 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </p>
                        <Link
                          href={profileHref}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Ver perfil e agendar
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {partners.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Parceiros neste spot</h2>
            <div className="space-y-3">
              {partners.map((partner: (typeof partners)[number]) => (
                <PartnerServiceCard
                  key={partner.id}
                  service={partner}
                  canRequest={canRequestPartner}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
