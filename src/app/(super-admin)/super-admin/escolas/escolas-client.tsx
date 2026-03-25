"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Store, Users, Award, MapPin, ArrowRight } from "@/lib/icons";

interface OrgRow {
  id: number;
  name: string;
  avatar: string | null;
  studentCount: number;
  instructorCount: number;
  spotCount: number;
}

export function EscolasClient({
  organizations,
}: {
  organizations: OrgRow[];
}) {
  const router = useRouter();

  async function handleEnterAsAdmin(orgId: number) {
    try {
      const res = await fetch("/api/super-admin/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Entrando como admin...");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Erro ao trocar organização");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Escolas</h1>
        <p className="text-muted-foreground text-sm">
          Todas as escolas cadastradas no sistema
        </p>
      </div>

      {organizations.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma escola cadastrada</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/10 text-violet-600 shrink-0 overflow-hidden">
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
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{org.name}</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {org.studentCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" />
                      {org.instructorCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {org.spotCount}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnterAsAdmin(org.id)}
                >
                  Entrar como Admin
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
