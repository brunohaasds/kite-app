import { Prisma } from "@/generated/prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { InstructorItem, InstructorExtras } from "./types";
import type { CreateInstructorInput, UpdateInstructorInput } from "./schema";

const instructorInclude = {
  user: { select: { name: true, email: true, phone: true } },
} as const;

type InstructorRow = {
  id: number;
  uuid: string;
  organization_id: number;
  user_id: number;
  certification: string | null;
  experience_years: number | null;
  bio: string | null;
  avatar: string | null;
  extras: Prisma.JsonValue | null;
  created_at: Date;
  user: { name: string; email: string; phone: string | null };
};

function mapRow(row: InstructorRow): InstructorItem {
  return {
    id: row.id,
    uuid: row.uuid,
    organization_id: row.organization_id,
    user_id: row.user_id,
    name: row.user.name,
    email: row.user.email,
    phone: row.user.phone,
    certification: row.certification,
    experience_years: row.experience_years,
    bio: row.bio,
    avatar: row.avatar,
    extras: row.extras as InstructorExtras | null,
    created_at: row.created_at,
  };
}

export async function listByOrg(orgId: number): Promise<InstructorItem[]> {
  const rows = await prisma.instructors.findMany({
    where: { organization_id: orgId, deleted_at: null },
    include: instructorInclude,
    orderBy: { user: { name: "asc" } },
  });
  return rows.map(mapRow);
}

export async function getById(id: number): Promise<InstructorItem | null> {
  const row = await prisma.instructors.findFirst({
    where: { id, deleted_at: null },
    include: instructorInclude,
  });
  return row ? mapRow(row) : null;
}

export async function getByUuid(uuid: string): Promise<InstructorItem | null> {
  const row = await prisma.instructors.findFirst({
    where: { uuid, deleted_at: null },
    include: instructorInclude,
  });
  return row ? mapRow(row) : null;
}

export async function create(orgId: number, data: CreateInstructorInput) {
  const hashedPassword = await hash(data.password, 12);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.users.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: "instructor",
      },
    });

    await tx.members.create({
      data: { organization_id: orgId, user_id: user.id },
    });

    const instructor = await tx.instructors.create({
      data: {
        organization_id: orgId,
        user_id: user.id,
        bio: data.bio,
        avatar: data.avatar,
        certification: data.certification,
        experience_years: data.experience_years,
        extras: data.extras
          ? (data.extras as Prisma.InputJsonValue)
          : undefined,
      },
      include: instructorInclude,
    });

    return mapRow(instructor);
  });
}

export async function update(id: number, data: UpdateInstructorInput) {
  const instructor = await prisma.instructors.findFirst({
    where: { id, deleted_at: null },
  });
  if (!instructor) throw new Error("Instrutor não encontrado");

  if (data.name || data.phone !== undefined) {
    await prisma.users.update({
      where: { id: instructor.user_id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });
  }

  const row = await prisma.instructors.update({
    where: { id },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.certification !== undefined && { certification: data.certification }),
      ...(data.experience_years !== undefined && { experience_years: data.experience_years }),
      ...(data.extras !== undefined && { extras: data.extras as Prisma.InputJsonValue }),
    },
    include: instructorInclude,
  });

  return mapRow(row);
}

export async function remove(id: number) {
  const instructor = await prisma.instructors.findFirst({
    where: { id, deleted_at: null },
  });
  if (!instructor) throw new Error("Instrutor não encontrado");

  await prisma.instructors.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  await prisma.users.update({
    where: { id: instructor.user_id },
    data: { deleted_at: new Date() },
  });
}
