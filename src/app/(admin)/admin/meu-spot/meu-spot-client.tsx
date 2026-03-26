"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Store,
  Globe,
  Shield,
} from "@/lib/icons";
import { ImageUpload } from "@/components/shared/image-upload";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";

interface SpotData {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  access: string;
  description: string | null;
  image: string | null;
  tips: string[];
  services: string[];
  parent_spot: { id: number; name: string; slug: string } | null;
  permissions: {
    id: number;
    organization_id: number;
    organization: { id: number; name: string; avatar: string | null };
    created_at: string;
  }[];
}

interface Org {
  id: number;
  name: string;
  avatar: string | null;
}

export function MeuSpotClient({
  spot,
  availableOrgs: initialAvailable,
}: {
  spot: SpotData;
  availableOrgs: Org[];
}) {
  const router = useRouter();

  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description ?? "");
  const [image, setImage] = useState(spot.image ?? "");
  const [tips, setTips] = useState(spot.tips);
  const [services, setServices] = useState(spot.services);
  const [newTip, setNewTip] = useState("");
  const [newService, setNewService] = useState("");
  const [saving, setSaving] = useState(false);

  const [addOrgOpen, setAddOrgOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [addingOrg, setAddingOrg] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokingOrgId, setRevokingOrgId] = useState<number | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function handleSaveInfo() {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/spots/update-owned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: spot.id,
          name: name.trim(),
          description: description.trim() || null,
          image: image.trim() || null,
          tips: tips.length > 0 ? tips : null,
          services: services.length > 0 ? services : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Spot atualizado!");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleGrantAccess() {
    if (!selectedOrgId) return;
    setAddingOrg(true);
    try {
      const res = await fetch("/api/admin/spots/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global_spot_id: spot.id,
          organization_id: parseInt(selectedOrgId, 10),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Escola adicionada!");
      setAddOrgOpen(false);
      setSelectedOrgId("");
      router.refresh();
    } catch {
      toast.error("Erro ao adicionar escola");
    } finally {
      setAddingOrg(false);
    }
  }

  async function handleRevokeAccess() {
    if (!revokingOrgId) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/admin/spots/revoke-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global_spot_id: spot.id,
          organization_id: revokingOrgId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Acesso revogado!");
      setRevokeOpen(false);
      setRevokingOrgId(null);
      router.refresh();
    } catch {
      toast.error("Erro ao revogar acesso");
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="space-y-8">
      <AdminSchoolPageHeader
        title="Meu Spot"
        subtitle="Gerencie as informações e acessos do seu spot"
      />

      {/* Section 1: Spot Info */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold">Informações do Spot</h2>

        {/* Readonly fields */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <span className="text-muted-foreground">Slug:</span>
            <span className="font-mono">/{spot.slug}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            {spot.access === "public" ? (
              <Globe className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Shield className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span>{spot.access === "public" ? "Público" : "Privado"}</span>
          </div>
          {spot.parent_spot && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <span className="text-muted-foreground">Dentro de:</span>
              <span>{spot.parent_spot.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Imagem de fundo do hero (página pública do spot)</Label>
          <ImageUpload
            currentImageUrl={image || null}
            onUpload={(url) => setImage(url)}
            context="global_spots"
            entityId={String(spot.id)}
            variant="cover"
            description="Mesma imagem exibida em /spot/[slug]. PNG, JPEG ou WebP até 2 MB."
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <Label>Dicas</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar dica..."
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTip.trim()) {
                    e.preventDefault();
                    setTips((t) => [...t, newTip.trim()]);
                    setNewTip("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newTip.trim()) {
                    setTips((t) => [...t, newTip.trim()]);
                    setNewTip("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {tips.map((tip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
                  >
                    {tip}
                    <button
                      type="button"
                      onClick={() =>
                        setTips((t) => t.filter((_, idx) => idx !== i))
                      }
                      className="ml-0.5 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Serviços</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar serviço..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newService.trim()) {
                    e.preventDefault();
                    setServices((s) => [...s, newService.trim()]);
                    setNewService("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newService.trim()) {
                    setServices((s) => [...s, newService.trim()]);
                    setNewService("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {services.map((svc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
                  >
                    {svc}
                    <button
                      type="button"
                      onClick={() =>
                        setServices((s) => s.filter((_, idx) => idx !== i))
                      }
                      className="ml-0.5 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveInfo} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Informações
          </Button>
        </div>
      </section>

      {/* Section 2: Authorized Schools */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Escolas Autorizadas</h2>
          <Button size="sm" onClick={() => setAddOrgOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Escola
          </Button>
        </div>

        {spot.permissions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Store className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma escola autorizada além da sua
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {spot.permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 overflow-hidden">
                  {perm.organization.avatar ? (
                    <img
                      src={perm.organization.avatar}
                      alt={perm.organization.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">
                    {perm.organization.name}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Desde {new Date(perm.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setRevokingOrgId(perm.organization_id);
                    setRevokeOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Org Dialog */}
      <Dialog
        open={addOrgOpen}
        onOpenChange={(open) => !addingOrg && setAddOrgOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Escola</DialogTitle>
            <DialogDescription>
              Selecione uma escola para autorizar acesso ao seu spot
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma escola" />
              </SelectTrigger>
              <SelectContent>
                {initialAvailable.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOrgOpen(false)}
              disabled={addingOrg}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGrantAccess}
              disabled={!selectedOrgId || addingOrg}
            >
              {addingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Autorizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog
        open={revokeOpen}
        onOpenChange={(open) => !revoking && setRevokeOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar acesso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o acesso desta escola ao seu spot?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRevokeOpen(false);
                setRevokingOrgId(null);
              }}
              disabled={revoking}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeAccess}
              disabled={revoking}
            >
              {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revogar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
