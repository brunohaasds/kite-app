import { prisma } from "@/lib/db";
import type { CreateUserInput, UpdateUserInput } from "./schema";
import type { UserBase } from "./types";

function mapUserBase(row: {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: Date;
}): UserBase {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    created_at: row.created_at,
  };
}

export async function list(organizationId: number): Promise<UserBase[]> {
  const rows = await prisma.users.findMany({
    where: {
      deleted_at: null,
      members: {
        some: {
          organization_id: organizationId,
          deleted_at: null,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
  return rows.map(mapUserBase);
}

export async function getById(id: number): Promise<UserBase | null> {
  const row = await prisma.users.findFirst({
    where: { id, deleted_at: null },
  });
  return row ? mapUserBase(row) : null;
}

export async function getByEmail(email: string) {
  return prisma.users.findFirst({
    where: { email, deleted_at: null },
  });
}

export async function create(data: CreateUserInput) {
  return prisma.users.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
    },
  });
}

export async function update(id: number, data: UpdateUserInput) {
  return prisma.users.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role !== undefined && { role: data.role }),
    },
  });
}

export async function remove(id: number) {
  return prisma.users.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}
