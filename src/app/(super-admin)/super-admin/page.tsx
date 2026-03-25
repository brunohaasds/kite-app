export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Store, MapPin, Award } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Dashboard - Super Admin",
};

export default async function SuperAdminDashboardPage() {
  await requireSuperAdmin();

  const [orgCount, studentCount, instructorCount, spotCount] =
    await Promise.all([
      prisma.organizations.count({ where: { deleted_at: null } }),
      prisma.students.count({ where: { deleted_at: null } }),
      prisma.instructors.count({ where: { deleted_at: null } }),
      prisma.global_spots.count({ where: { deleted_at: null } }),
    ]);

  const kpis = [
    { label: "Escolas", value: orgCount, icon: Store },
    { label: "Alunos", value: studentCount, icon: Users },
    { label: "Instrutores", value: instructorCount, icon: Award },
    { label: "Global Spots", value: spotCount, icon: MapPin },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-super-admin/10 text-super-admin">
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-auto justify-center py-3"
          >
            <Link href="/super-admin/spots">Gerenciar Spots</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto justify-center py-3"
          >
            <Link href="/super-admin/escolas">Ver Escolas</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto justify-center py-3"
          >
            <Link href="/super-admin/alunos">Ver Alunos</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
