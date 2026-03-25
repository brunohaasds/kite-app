"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Calendar, CheckCircle2 } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import type { StatusKey } from "@/lib/styles/status-colors";

interface MyPackage {
  id: number;
  title: string;
  sessionsUsed: number;
  sessionsTotal: number;
  sessionsRemaining: number;
  status: string;
  expiryDate: string | null;
  pricePerSession: number;
}

interface AvailablePackage {
  id: number;
  title: string;
  description: string | null;
  sessionCount: number;
  price: number;
  pricePerSession: number;
  validityDays: number | null;
}

interface Props {
  myPackages: MyPackage[];
  availablePackages: AvailablePackage[];
  studentId: number;
}

export function PacotesClient({ myPackages, availablePackages, studentId }: Props) {
  const router = useRouter();
  const [buyPkg, setBuyPkg] = useState<AvailablePackage | null>(null);
  const [buying, setBuying] = useState(false);

  async function handlePurchase(packageId: number) {
    setBuying(true);
    try {
      const res = await fetch("/api/packages/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, packageId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pacote adquirido com sucesso!");
      setBuyPkg(null);
      router.refresh();
    } catch {
      toast.error("Erro ao adquirir pacote.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg -mx-4 -mt-4 mb-6">
        <h1 className="mb-1 text-2xl font-bold">Meus Pacotes</h1>
        <p className="text-sm opacity-90">{myPackages.length} pacote{myPackages.length !== 1 && "s"} ativo{myPackages.length !== 1 && "s"}</p>
      </div>

      {/* Active packages */}
      {myPackages.length > 0 ? (
        <div className="space-y-3">
          {myPackages.map((pkg) => {
            const progress = (pkg.sessionsUsed / pkg.sessionsTotal) * 100;
            return (
              <div key={pkg.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{pkg.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(pkg.pricePerSession)} por aula
                    </p>
                  </div>
                  <StatusBadge status={pkg.status as StatusKey} />
                </div>

                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {pkg.sessionsUsed}/{pkg.sessionsTotal} aulas
                    </span>
                    <span className="font-medium text-primary">
                      {pkg.sessionsRemaining} restantes
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {pkg.expiryDate && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Válido até {new Date(pkg.expiryDate).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum pacote ativo</p>
        </div>
      )}

      {/* Available packages */}
      {availablePackages.length > 0 && (
        <>
          <h2 className="text-xl font-bold">Pacotes disponíveis</h2>
          <div className="space-y-3">
            {availablePackages.map((pkg) => (
              <div key={pkg.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{pkg.title}</h3>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(pkg.price)}
                  </p>
                </div>

                <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{pkg.sessionCount} aulas</span>
                  <span>{formatCurrency(pkg.pricePerSession)}/aula</span>
                  {pkg.validityDays && <span>{pkg.validityDays} dias</span>}
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setBuyPkg(pkg)}
                >
                  Adquirir pacote
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Purchase dialog */}
      <Dialog open={!!buyPkg} onOpenChange={() => setBuyPkg(null)}>
        <DialogContent className="max-w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirmar compra</DialogTitle>
          </DialogHeader>
          {buyPkg && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold">{buyPkg.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {buyPkg.sessionCount} aulas • {formatCurrency(buyPkg.price)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBuyPkg(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  disabled={buying}
                  onClick={() => handlePurchase(buyPkg.id)}
                >
                  {buying ? "Processando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
