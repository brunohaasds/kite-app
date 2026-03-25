"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Pencil,
  Trash2,
  Loader2,
  Globe,
  Shield,
  Eye,
  Search,
} from "@/lib/icons";
import { ImageUpload } from "@/components/shared/image-upload";

interface SpotRow {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  access: "public" | "private";
  description: string | null;
  image: string | null;
  tips: string[] | null;
  services: string[] | null;
  latitude: number | null;
  longitude: number | null;
  parent_spot_id: number | null;
  owner_organization_id: number | null;
  parent_spot: { id: number; name: string; slug: string } | null;
  owner_organization: { id: number; name: string } | null;
  _count: { spots: number; permissions: number };
}

interface Org {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  slug: string;
  access: "public" | "private";
  description: string;
  image: string;
  tips: string[];
  services: string[];
  parent_spot_id: number | null;
  owner_organization_id: number | null;
}

const emptyForm: FormData = {
  name: "",
  slug: "",
  access: "public",
  description: "",
  image: "",
  tips: [],
  services: [],
  parent_spot_id: null,
  owner_organization_id: null,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SpotsClient({
  spots: initial,
  publicSpots,
  organizations,
}: {
  spots: SpotRow[];
  publicSpots: SpotRow[];
  organizations: Org[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [newTip, setNewTip] = useState("");
  const [newService, setNewService] = useState("");
  const [search, setSearch] = useState("");

  const filteredSpots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((s) => {
      const parts = [
        s.name,
        s.slug,
        s.owner_organization?.name ?? "",
        s.parent_spot?.name ?? "",
        s.parent_spot?.slug ?? "",
      ];
      return parts.some((p) => p.toLowerCase().includes(q));
    });
  }, [initial, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(spot: SpotRow) {
    setEditingId(spot.id);
    setForm({
      name: spot.name,
      slug: spot.slug,
      access: spot.access,
      description: spot.description ?? "",
      image: spot.image ?? "",
      tips: spot.tips ?? [],
      services: spot.services ?? [],
      parent_spot_id: spot.parent_spot_id,
      owner_organization_id: spot.owner_organization_id,
    });
    setFormOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      ...(editingId ? {} : { slug: slugify(name) }),
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Nome e slug são obrigatórios");
      return;
    }
    if (form.access === "private" && !form.owner_organization_id) {
      toast.error("Spot privado requer escola dona");
      return;
    }
    setLoading(true);
    try {
      const endpoint = editingId
        ? "/api/super-admin/spots/update"
        : "/api/super-admin/spots/create";
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name.trim(),
        slug: form.slug.trim(),
        access: form.access,
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        tips: form.tips.length > 0 ? form.tips : null,
        services: form.services.length > 0 ? form.services : null,
        parent_spot_id: form.parent_spot_id,
        owner_organization_id:
          form.access === "private" ? form.owner_organization_id : null,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha na operação");
      }

      toast.success(editingId ? "Spot atualizado!" : "Spot criado!");
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar spot");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/spots/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      toast.success("Spot excluído!");
      setDeleteOpen(false);
      setDeletingId(null);
      router.refresh();
    } catch {
      toast.error("Erro ao excluir spot");
    } finally {
      setLoading(false);
    }
  }

  const parentSpots = filteredSpots.filter((s) => !s.parent_spot_id);
  const childSpots = filteredSpots.filter((s) => s.parent_spot_id);

  function renderSpotCard(spot: SpotRow, indented = false) {
    return (
      <div
        key={spot.uuid}
        className={`rounded-xl border bg-card p-4 shadow-sm ${indented ? "ml-8 border-l-4 border-l-super-admin/35" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-super-admin/10 text-super-admin shrink-0">
            <MapPin className="h-5 w-5" />
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
            <p className="text-sm text-muted-foreground truncate">
              /{spot.slug}
              {spot.owner_organization && (
                <> · Dono: {spot.owner_organization.name}</>
              )}
              {spot.parent_spot && <> · Pai: {spot.parent_spot.name}</>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {spot._count.spots} escolas vinculadas ·{" "}
              {spot._count.permissions} permissões
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" asChild title="Ver página pública do spot">
              <Link href={`/spot/${spot.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver página pública</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEdit(spot)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                setDeletingId(spot.id);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Global Spots</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os spots disponíveis no sistema
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Spot
        </Button>
      </div>

      {initial.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, slug, escola dona ou spot pai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {initial.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum spot cadastrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crie o primeiro spot global.
          </p>
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum spot encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente outro termo de busca.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {parentSpots.map((spot) => (
            <div key={spot.uuid}>
              {renderSpotCard(spot)}
              {childSpots
                .filter((c) => c.parent_spot_id === spot.id)
                .map((child) => renderSpotCard(child, true))}
            </div>
          ))}
          {childSpots
            .filter(
              (c) => !parentSpots.find((p) => p.id === c.parent_spot_id),
            )
            .map((spot) => renderSpotCard(spot))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => !loading && setFormOpen(open)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Spot" : "Novo Spot Global"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Atualize as informações do spot"
                : "Crie um novo spot global"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUpload
                currentImageUrl={form.image || null}
                onUpload={(url) => setForm((f) => ({ ...f, image: url }))}
                context="organizations"
                size="lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Praia do Cumbuco"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="praia-do-cumbuco"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descrição do spot..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Acesso</Label>
              <Select
                value={form.access}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    access: v as "public" | "private",
                    ...(v === "public"
                      ? { owner_organization_id: null, parent_spot_id: null }
                      : {}),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.access === "private" && (
              <>
                <div className="space-y-2">
                  <Label>Escola Dona</Label>
                  <Select
                    value={
                      form.owner_organization_id
                        ? String(form.owner_organization_id)
                        : ""
                    }
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        owner_organization_id: parseInt(v, 10),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola dona" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={String(org.id)}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Spot Pai (opcional)</Label>
                  <Select
                    value={
                      form.parent_spot_id
                        ? String(form.parent_spot_id)
                        : "none"
                    }
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        parent_spot_id: v === "none" ? null : parseInt(v, 10),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {publicSpots.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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
                      setForm((f) => ({
                        ...f,
                        tips: [...f.tips, newTip.trim()],
                      }));
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
                      setForm((f) => ({
                        ...f,
                        tips: [...f.tips, newTip.trim()],
                      }));
                      setNewTip("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.tips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.tips.map((tip, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {tip}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            tips: f.tips.filter((_, idx) => idx !== i),
                          }))
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
                      setForm((f) => ({
                        ...f,
                        services: [...f.services, newService.trim()],
                      }));
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
                      setForm((f) => ({
                        ...f,
                        services: [...f.services, newService.trim()],
                      }));
                      setNewService("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.services.map((svc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {svc}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            services: f.services.filter((_, idx) => idx !== i),
                          }))
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !loading && setDeleteOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir spot</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este spot? Escolas vinculadas
              perderão a referência.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeletingId(null);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
