import { prisma } from "@/lib/db";
import type { CreatePackageInput, UpdatePackageInput } from "./schema";
import type { PackageItem, StudentPackageItem } from "./types";

function mapPackageItem(row: {
  id: number;
  uuid: string;
  organization_id: number;
  title: string;
  description: string | null;
  session_count: number;
  session_duration_minutes: number;
  price: unknown;
  validity_days: number | null;
  active: boolean;
}): PackageItem {
  const price = Number(row.price as number);
  return {
    id: row.id,
    uuid: row.uuid,
    organization_id: row.organization_id,
    title: row.title,
    description: row.description,
    session_count: row.session_count,
    session_duration_minutes: row.session_duration_minutes,
    price,
    validity_days: row.validity_days,
    active: row.active,
  };
}

function mapStudentPackageRow(row: {
  id: number;
  uuid: string;
  student_id: number;
  package_id: number;
  sessions_total: number;
  sessions_used: number;
  sessions_remaining: number;
  status: string;
  purchase_date: Date;
  expiry_date: Date | null;
  package: {
    id: number;
    uuid: string;
    organization_id: number;
    title: string;
    description: string | null;
    session_count: number;
    session_duration_minutes: number;
    price: unknown;
    validity_days: number | null;
    active: boolean;
  };
}): StudentPackageItem {
  return {
    id: row.id,
    uuid: row.uuid,
    student_id: row.student_id,
    package_id: row.package_id,
    sessions_total: row.sessions_total,
    sessions_used: row.sessions_used,
    sessions_remaining: row.sessions_remaining,
    status: row.status,
    purchase_date: row.purchase_date,
    expiry_date: row.expiry_date,
    package: mapPackageItem(row.package),
  };
}

export async function listByOrg(organizationId: number): Promise<PackageItem[]> {
  const items = await prisma.packages.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    orderBy: { created_at: "desc" },
  });
  return items.map(mapPackageItem);
}

export async function listStudentPackages(studentId: number): Promise<StudentPackageItem[]> {
  const items = await prisma.student_packages.findMany({
    where: { student_id: studentId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: {
      package: true,
    },
  });
  return items.map(mapStudentPackageRow);
}

export async function create(organizationId: number, data: CreatePackageInput) {
  return prisma.packages.create({
    data: {
      organization_id: organizationId,
      title: data.title,
      description: data.description,
      session_count: data.session_count,
      session_duration_minutes: 120,
      price: data.price,
      validity_days: data.validity_days ?? undefined,
    },
  });
}

export async function update(id: number, data: UpdatePackageInput) {
  return prisma.packages.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.session_count !== undefined && { session_count: data.session_count }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.validity_days !== undefined && { validity_days: data.validity_days }),
    },
  });
}

export async function remove(id: number) {
  return prisma.packages.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export async function purchase(studentId: number, packageId: number) {
  return prisma.$transaction(async (tx) => {
    const pkg = await tx.packages.findFirst({
      where: { id: packageId, deleted_at: null, active: true },
    });
    if (!pkg) {
      throw new Error("Pacote não encontrado ou inativo");
    }

    const student = await tx.students.findFirst({
      where: { id: studentId, deleted_at: null },
    });
    if (!student) {
      throw new Error("Aluno não encontrado");
    }

    if (student.organization_id !== pkg.organization_id) {
      throw new Error("Pacote não pertence à organização do aluno");
    }

    const sessionsTotal = pkg.session_count;
    const purchaseDate = new Date();
    let expiryDate: Date | null = null;
    if (pkg.validity_days != null) {
      expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + pkg.validity_days);
    }

    const created = await tx.student_packages.create({
      data: {
        student_id: studentId,
        package_id: packageId,
        sessions_total: sessionsTotal,
        sessions_used: 0,
        sessions_remaining: sessionsTotal,
        status: "active",
        purchase_date: purchaseDate,
        expiry_date: expiryDate,
      },
      include: { package: true },
    });

    return mapStudentPackageRow(created);
  });
}

export async function useCredit(studentPackageId: number) {
  return prisma.$transaction(async (tx) => {
    const sp = await tx.student_packages.findFirst({
      where: { id: studentPackageId, deleted_at: null },
    });
    if (!sp) {
      throw new Error("Pacote do aluno não encontrado");
    }
    if (sp.status !== "active") {
      throw new Error("Pacote não está ativo");
    }
    if (sp.expiry_date && sp.expiry_date < new Date()) {
      throw new Error("Pacote expirado");
    }
    if (sp.sessions_remaining <= 0) {
      throw new Error("Sem créditos restantes");
    }

    const sessionsRemaining = sp.sessions_remaining - 1;
    const sessionsUsed = sp.sessions_used + 1;

    return tx.student_packages.update({
      where: { id: studentPackageId },
      data: {
        sessions_remaining: sessionsRemaining,
        sessions_used: sessionsUsed,
        status: sessionsRemaining === 0 ? "completed" : sp.status,
      },
    });
  });
}
