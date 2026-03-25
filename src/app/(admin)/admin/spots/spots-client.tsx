"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Check, X, Globe, Shield, Loader2 } from "@/lib/icons";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";

interface GlobalSpotRow {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  access: "public" | "private";
  description: string | null;
  image: string | null;
  parent_spot: { id: number; name: string; slug: string } | null;
  owner_organization: { id: number; name: string } | null;
}

export function SpotsClient({
  globalSpots,
  linkedGlobalSpotIds: initialLinked,
  linkedSpotMap: initialMap,
}: {
  globalSpots: GlobalSpotRow[];
  linkedGlobalSpotIds: number[];
  linkedSpotMap: Record<number, number>;
}) {
  const router = useRouter();
  const [linkedIds, setLinkedIds] = useState(new Set(initialLinked));
  const [spotMap, setSpotMap] = useState<Record<number, number>>(initialMap);
  const [loading, setLoading] = useState<number | null>(null);
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);

  async function handleLink(globalSpotId: number) {
    setLoading(globalSpotId);
    try {
      const res = await fetch("/api/admin/spots/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ global_spot_id: globalSpotId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro");
      }
      const spot = await res.json();
      setLinkedIds((prev) => new Set([...prev, globalSpotId]));
      setSpotMap((prev) => ({ ...prev, [globalSpotId]: spot.id }));
      toast.success("Spot vinculado!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao vincular");
    } finally {
      setLoading(null);
    }
  }

  async function handleUnlink() {
    if (!unlinkingId) return;
    const spotId = spotMap[unlinkingId];
    if (!spotId) return;

    setLoading(unlinkingId);
    try {
      const res = await fetch("/api/admin/spots/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spot_id: spotId }),
      });
      if (!res.ok) throw new Error();
      setLinkedIds((prev) => {
        const next = new Set(prev);
        next.delete(unlinkingId);
        return next;
      });
      toast.success("Spot desvinculado!");
      setUnlinkOpen(false);
      setUnlinkingId(null);
      router.refresh();
    } catch {
      toast.error("Erro ao desvincular");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSchoolPageHeader
        title="Spots"
        subtitle="Vincule sua escola aos spots disponíveis"
      />

      {globalSpots.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum spot disponível</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Spots são gerenciados pelo super-admin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {globalSpots.map((spot) => {
            const isLinked = linkedIds.has(spot.id);
            return (
              <div
                key={spot.uuid}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                      isLinked
                        ? "bg-green-100 text-green-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isLinked ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{spot.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          spot.access === "public"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {spot.access === "public" ? (
                          <Globe className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {spot.access === "public" ? "Público" : "Privado"}
                      </span>
                    </div>
                    {spot.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {spot.description}
                      </p>
                    )}
                    {spot.parent_spot && (
                      <p className="text-xs text-muted-foreground">
                        Dentro de: {spot.parent_spot.name}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isLinked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={loading === spot.id}
                        onClick={() => {
                          setUnlinkingId(spot.id);
                          setUnlinkOpen(true);
                        }}
                      >
                        {loading === spot.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Desvincular
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading === spot.id}
                        onClick={() => handleLink(spot.id)}
                      >
                        {loading === spot.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Vincular"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={unlinkOpen}
        onOpenChange={(open) => {
          if (!loading) {
            setUnlinkOpen(open);
            if (!open) setUnlinkingId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular spot</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desvincular este spot da sua escola?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUnlinkOpen(false);
                setUnlinkingId(null);
              }}
              disabled={!!loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlink}
              disabled={!!loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
