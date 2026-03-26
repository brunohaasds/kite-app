import { randomUUID } from "crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { AddSlotInput, CreateAgendaInput } from "./schema";
import type { AgendaItem, AgendaSlotItem } from "./types";

const slotInclude = {
  spot: { select: { id: true, name: true } },
  instructor: {
    select: {
      id: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

function mapSlotRow(row: {
  id: number;
  uuid: string;
  agenda_id: number;
  spot_id: number | null;
  instructor_id: number | null;
  time: string;
  booked: boolean;
  spot?: { id: number; name: string } | null;
  instructor?: { id: number; user: { id: number; name: string } } | null;
}): AgendaSlotItem {
  return {
    id: row.id,
    uuid: row.uuid,
    agenda_id: row.agenda_id,
    spot_id: row.spot_id,
    instructor_id: row.instructor_id,
    time: row.time,
    booked: row.booked,
    spot: row.spot ?? undefined,
    instructor: row.instructor ?? undefined,
  };
}

function mapAgendaRow(row: {
  id: number;
  uuid: string;
  organization_id: number;
  slug: string;
  date: Date;
  day_name: string;
  published: boolean;
  rules: unknown;
  slots: Array<{
    id: number;
    uuid: string;
    agenda_id: number;
    spot_id: number | null;
    instructor_id: number | null;
    time: string;
    booked: boolean;
    spot?: { id: number; name: string } | null;
    instructor?: { id: number; user: { id: number; name: string } } | null;
  }>;
}): AgendaItem {
  return {
    id: row.id,
    uuid: row.uuid,
    organization_id: row.organization_id,
    slug: row.slug,
    date: row.date,
    day_name: row.day_name,
    published: row.published,
    rules: row.rules,
    slots: row.slots.map(mapSlotRow),
  };
}

export async function listByOrg(organizationId: number): Promise<AgendaItem[]> {
  const rows = await prisma.agendas.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: {
      slots: {
        where: { deleted_at: null },
        orderBy: { time: "asc" },
        include: slotInclude,
      },
    },
  });
  return rows.map(mapAgendaRow);
}

export async function getBySlug(slug: string): Promise<AgendaItem | null> {
  const row = await prisma.agendas.findFirst({
    where: { slug, deleted_at: null },
    include: {
      slots: {
        where: { deleted_at: null },
        orderBy: { time: "asc" },
        include: slotInclude,
      },
    },
  });
  return row ? mapAgendaRow(row) : null;
}

export async function create(data: CreateAgendaInput) {
  const y = data.date.getFullYear();
  const m = String(data.date.getMonth() + 1).padStart(2, "0");
  const d = String(data.date.getDate()).padStart(2, "0");
  const slug = `agenda-${data.organization_id}-${y}-${m}-${d}-${randomUUID().slice(0, 8)}`;

  const row = await prisma.agendas.create({
    data: {
      organization_id: data.organization_id,
      slug,
      date: data.date,
      day_name: data.day_name,
    },
    include: {
      slots: {
        where: { deleted_at: null },
        orderBy: { time: "asc" },
        include: slotInclude,
      },
    },
  });
  return mapAgendaRow(row);
}

export async function addSlot(data: AddSlotInput) {
  const agenda = await prisma.agendas.findFirst({
    where: { id: data.agenda_id, deleted_at: null },
  });
  if (!agenda) {
    throw new Error("Agenda não encontrada");
  }

  const row = await prisma.agenda_slots.create({
    data: {
      agenda_id: data.agenda_id,
      spot_id: data.spot_id ?? undefined,
      instructor_id: data.instructor_id ?? undefined,
      time: data.time,
    },
    include: slotInclude,
  });
  return mapSlotRow(row);
}

export async function removeSlot(slotId: number) {
  const existing = await prisma.agenda_slots.findFirst({
    where: { id: slotId, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Slot não encontrado");
  }
  return prisma.agenda_slots.update({
    where: { id: slotId },
    data: { deleted_at: new Date() },
  });
}

export async function publish(agendaId: number) {
  const existing = await prisma.agendas.findFirst({
    where: { id: agendaId, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Agenda não encontrada");
  }
  const row = await prisma.agendas.update({
    where: { id: agendaId },
    data: { published: true },
    include: {
      slots: {
        where: { deleted_at: null },
        orderBy: { time: "asc" },
        include: slotInclude,
      },
    },
  });
  return mapAgendaRow(row);
}

export async function bookSlotInTransaction(tx: Prisma.TransactionClient, slotId: number) {
  const slot = await tx.agenda_slots.findFirst({
    where: { id: slotId, deleted_at: null },
  });
  if (!slot) {
    throw new Error("Slot não encontrado");
  }
  if (slot.booked) {
    throw new Error("Slot já reservado");
  }

  const row = await tx.agenda_slots.update({
    where: { id: slotId },
    data: { booked: true },
    include: slotInclude,
  });
  return mapSlotRow(row);
}

export async function bookSlot(slotId: number) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) =>
    bookSlotInTransaction(tx, slotId),
  );
}
