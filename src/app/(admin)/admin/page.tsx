export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";
import {
  Users,
  Award,
  Calendar,
  DollarSign,
  Plus,
  Mail,
  Globe,
} from "@/lib/icons";

const quickActionClass =
  "group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const quickActionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15";

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
      <AdminSchoolPageHeader
        title="Dashboard"
        subtitle={schoolName}
        subtitleMobileOnly
        desktopEndDesktopOnly
        desktopEnd={
          <Link
            href="/admin/escola"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {schoolName}
          </Link>
        }
      />

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
        <h2 className="text-lg font-semibold">Ações rápidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/agenda/nova" className={quickActionClass}>
            <span className={quickActionIconClass}>
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">Nova agenda</span>
          </Link>
          <Link href="/admin/alunos" className={quickActionClass}>
            <span className={quickActionIconClass}>
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">Ver alunos</span>
          </Link>
          <Link href="/admin/agenda" className={quickActionClass}>
            <span className={quickActionIconClass}>
              <Calendar className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">Ver agenda</span>
          </Link>
          <Link href="/admin/financeiro" className={quickActionClass}>
            <span className={quickActionIconClass}>
              <DollarSign className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">Financeiro</span>
          </Link>
          <Link href="/admin/convites" className={quickActionClass}>
            <span className={quickActionIconClass}>
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">Ver convites</span>
          </Link>
          <Link
            href={`/escola/${organizationId}`}
            className={quickActionClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={quickActionIconClass}>
              <Globe className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left font-medium leading-snug">
              Ver página da escola
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
