import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getById } from "@/domain/organizations/repo";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "@/lib/icons";
import { MobileContainer } from "@/components/layout/mobile-container";
import { AgendaPublicClient } from "./agenda-public-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const orgId = Number(id);
  if (isNaN(orgId)) {
    return { title: "Agenda" };
  }
  const org = await getById(orgId);
  if (!org) {
    return { title: "Agenda não encontrada" };
  }
  return {
    title: `Agenda - ${org.name}`,
  };
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

  const dayGroups = agendas.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    dateLabel: a.date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
    dayShort: a.date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    dayNum: a.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    slots: a.slots.map((s) => ({
      time: s.time,
      instructor: s.instructor?.user.name ?? "A definir",
      booked: s.booked,
      spotName: s.spot?.name ?? null,
      slotId: s.id,
    })),
  }));

  return (
    <MobileContainer>
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/escola/${orgId}`}>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Agenda</h1>
        </div>
        <p className="text-sm opacity-90">{org.name}</p>
      </div>

      <AgendaPublicClient orgId={orgId} dayGroups={dayGroups} />
    </MobileContainer>
  );
}
