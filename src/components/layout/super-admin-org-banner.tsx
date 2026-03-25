"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";

export function SuperAdminOrgBanner({ orgName }: { orgName: string }) {
  const router = useRouter();

  async function exitOrg() {
    try {
      const res = await fetch("/api/super-admin/switch-org", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Saindo do contexto da escola");
      router.push("/super-admin");
      router.refresh();
    } catch {
      toast.error("Não foi possível sair");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-super-admin-banner-border bg-super-admin-banner px-4 py-2.5 text-sm text-super-admin-banner-foreground">
      <div className="flex items-center gap-2 min-w-0">
        <Shield className="h-4 w-4 shrink-0 text-super-admin" />
        <span className="truncate">
          Você está como admin de <strong>{orgName}</strong>
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 text-super-admin hover:bg-super-admin/10 dark:hover:bg-super-admin/25"
        onClick={exitOrg}
      >
        <X className="mr-1 h-3.5 w-3.5" />
        Voltar ao Super Admin
      </Button>
    </div>
  );
}
