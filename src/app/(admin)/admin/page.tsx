export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Award, Calendar, DollarSign } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Dashboard - Admin",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;
  if (organizationId == null) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">
          Nenhuma organização vinculada à sua conta.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/escola">Configurar escola</Link>
        </Button>
      </div>
    );
  }

  const selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const [
    org,
    studentCount,
    instructorCount,
    sessionsTodayCount,
    pendingPaymentsCount,
  ] = await Promise.all([
    prisma.organizations.findFirst({
      where: { id: organizationId, deleted_at: null },
      select: { name: true },
    }),
    prisma.members.count({
      where: {
        organization_id: organizationId,
        deleted_at: null,
        user: { role: "student", deleted_at: null },
      },
    }),
    prisma.instructors.count({
      where: { organization_id: organizationId, deleted_at: null },
    }),
    prisma.sessions.count({
      where: {
        deleted_at: null,
        date: { gte: selectedDate, lt: nextDay },
        agenda_slot: {
          agenda: {
            organization_id: organizationId,
            deleted_at: null,
          },
        },
      },
    }),
    prisma.payments.count({
      where: {
        organization_id: organizationId,
        deleted_at: null,
        status: "pending",
      },
    }),
  ]);

  const schoolName = org?.name ?? "Escola";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link
          href="/admin/escola"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {schoolName}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{studentCount}</p>
              <p className="text-xs text-muted-foreground">Alunos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{instructorCount}</p>
              <p className="text-xs text-muted-foreground">Instrutores</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessionsTodayCount}</p>
              <p className="text-xs text-muted-foreground">Aulas Hoje</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingPaymentsCount}</p>
              <p className="text-xs text-muted-foreground">
                Pagamentos Pendentes
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button asChild variant="outline" className="h-auto justify-center py-3">
            <Link href="/admin/agenda/nova">Nova Agenda</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-center py-3">
            <Link href="/admin/alunos">Ver Alunos</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-center py-3">
            <Link href="/admin/agenda">Ver Agenda</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-center py-3">
            <Link href="/admin/financeiro">Financeiro</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
