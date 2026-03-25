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
    <div className="flex items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-4 py-2.5 text-sm text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
      <div className="flex items-center gap-2 min-w-0">
        <Shield className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Você está como admin de <strong>{orgName}</strong>
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 text-violet-800 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-violet-900/50"
        onClick={exitOrg}
      >
        <X className="mr-1 h-3.5 w-3.5" />
        Voltar ao Super Admin
      </Button>
    </div>
  );
}
