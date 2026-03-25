import { prisma } from "@/lib/db";
import type { CreateSessionInput, UpdateStatusInput } from "./schema";
import type { SessionItem } from "./types";

const sessionInclude = {
  spot: { select: { id: true, name: true } },
  student: {
    select: {
      id: true,
      user: { select: { id: true, name: true, phone: true } },
    },
  },
  instructor: {
    select: {
      id: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

function mapSessionRow(row: {
  id: number;
  uuid: string;
  organization_id: number;
  spot_id: number | null;
  student_id: number | null;
  instructor_id: number | null;
  student_package_id: number | null;
  date: Date;
  start_time: string;
  end_time: string | null;
  status: string;
  type: string | null;
  notes: string | null;
  spot?: { id: number; name: string } | null;
  student?: {
    id: number;
    user: { id: number; name: string; phone: string | null };
  } | null;
  instructor?: {
    id: number;
    user: { id: number; name: string };
  } | null;
}): SessionItem {
  return {
    id: row.id,
    uuid: row.uuid,
    organization_id: row.organization_id,
    spot_id: row.spot_id,
    student_id: row.student_id,
    instructor_id: row.instructor_id,
    student_package_id: row.student_package_id,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    type: row.type,
    notes: row.notes,
    spot: row.spot ?? undefined,
    student: row.student ?? undefined,
    instructor: row.instructor ?? undefined,
  };
}

export async function listByOrg(organizationId: number, date?: Date): Promise<SessionItem[]> {
  const rows = await prisma.sessions.findMany({
    where: {
      organization_id: organizationId,
      deleted_at: null,
      ...(date !== undefined
        ? {
            date: {
              equals: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              ),
            },
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
    include: sessionInclude,
  });
  return rows.map(mapSessionRow);
}

export async function listByStudent(studentId: number): Promise<SessionItem[]> {
  const rows = await prisma.sessions.findMany({
    where: { student_id: studentId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: sessionInclude,
  });
  return rows.map(mapSessionRow);
}

export async function listByInstructor(instructorId: number): Promise<SessionItem[]> {
  const rows = await prisma.sessions.findMany({
    where: { instructor_id: instructorId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: sessionInclude,
  });
  return rows.map(mapSessionRow);
}

export async function create(data: CreateSessionInput) {
  const row = await prisma.sessions.create({
    data: {
      organization_id: data.organization_id,
      spot_id: data.spot_id ?? undefined,
      student_id: data.student_id ?? undefined,
      instructor_id: data.instructor_id ?? undefined,
      student_package_id: data.student_package_id ?? undefined,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time ?? undefined,
      status: "scheduled",
      type: data.type ?? undefined,
      notes: data.notes ?? undefined,
    },
    include: sessionInclude,
  });
  return mapSessionRow(row);
}

export async function updateStatus(id: number, data: UpdateStatusInput) {
  const existing = await prisma.sessions.findFirst({
    where: { id, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Sessão não encontrada");
  }
  const row = await prisma.sessions.update({
    where: { id },
    data: { status: data.status },
    include: sessionInclude,
  });
  return mapSessionRow(row);
}

export async function cancel(id: number) {
  const existing = await prisma.sessions.findFirst({
    where: { id, deleted_at: null },
  });
  if (!existing) {
    throw new Error("Sessão não encontrada");
  }
  const row = await prisma.sessions.update({
    where: { id },
    data: { status: "cancelled" },
    include: sessionInclude,
  });
  return mapSessionRow(row);
}
