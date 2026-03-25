"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Package, Users, Calendar, Trash2, Loader2 } from "@/lib/icons";
import { toast } from "sonner";

interface PackageRow {
  uuid: string;
  title: string;
  description: string | null;
  sessionCount: number;
  price: number;
  validityDays: number | null;
  active: boolean;
  activeStudents: number;
}

interface FormData {
  title: string;
  description: string;
  session_count: string;
  price: string;
  validity_days: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  session_count: "",
  price: "",
  validity_days: "",
};

export function PacotesAdminClient({
  packages: initialPackages,
}: {
  packages: PackageRow[];
}) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditingUuid(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(pkg: PackageRow) {
    setEditingUuid(pkg.uuid);
    setForm({
      title: pkg.title,
      description: pkg.description ?? "",
      session_count: String(pkg.sessionCount),
      price: String(pkg.price),
      validity_days: pkg.validityDays ? String(pkg.validityDays) : "",
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.session_count || !form.price) {
      toast.error("Preencha título, número de aulas e preço");
      return;
    }

    setLoading(true);
    try {
      const endpoint = editingUuid
        ? "/api/admin/packages/update"
        : "/api/admin/packages/create";

      const body = {
        ...(editingUuid && { uuid: editingUuid }),
        title: form.title,
        description: form.description || null,
        session_count: Number(form.session_count),
        price: Number(form.price),
        validity_days: form.validity_days ? Number(form.validity_days) : null,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Falha na operação");

      toast.success(editingUuid ? "Pacote atualizado!" : "Pacote criado!");
      setFormOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar pacote");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingUuid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: deletingUuid }),
      });

      if (!res.ok) throw new Error("Falha ao excluir");

      setPackages((prev) => prev.filter((p) => p.uuid !== deletingUuid));
      toast.success("Pacote excluído!");
      setDeleteOpen(false);
      setDeletingUuid(null);
      router.refresh();
    } catch {
      toast.error("Erro ao excluir pacote");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(pkg: PackageRow) {
    try {
      const res = await fetch("/api/admin/packages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: pkg.uuid, active: !pkg.active }),
      });

      if (!res.ok) throw new Error("Falha na operação");

      setPackages((prev) =>
        prev.map((p) =>
          p.uuid === pkg.uuid ? { ...p, active: !p.active } : p,
        ),
      );
      toast.success(pkg.active ? "Pacote desativado" : "Pacote ativado");
    } catch {
      toast.error("Erro ao atualizar pacote");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacotes</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os pacotes de aulas
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum pacote cadastrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crie seu primeiro pacote de aulas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.uuid}
              className={`rounded-xl border bg-card p-5 shadow-sm ${!pkg.active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{pkg.title}</h3>
                    <Badge variant={pkg.active ? "default" : "secondary"}>
                      {pkg.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {pkg.sessionCount} aulas
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(pkg.price)}
                    </span>
                    {pkg.validityDays && (
                      <span>{pkg.validityDays} dias de validade</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {pkg.activeStudents} aluno{pkg.activeStudents !== 1 && "s"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(pkg)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(pkg)}
                  >
                    {pkg.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      setDeletingUuid(pkg.uuid);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => !loading && setFormOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUuid ? "Editar Pacote" : "Novo Pacote"}
            </DialogTitle>
            <DialogDescription>
              {editingUuid
                ? "Atualize as informações do pacote"
                : "Preencha os dados do novo pacote"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-title">Título</Label>
              <Input
                id="pkg-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Pacote 5 aulas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-desc">Descrição</Label>
              <Input
                id="pkg-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Descrição opcional"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pkg-sessions">Nº de aulas</Label>
                <Input
                  id="pkg-sessions"
                  type="number"
                  min="1"
                  value={form.session_count}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, session_count: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-price">Preço (R$)</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-validity">Validade (dias, opcional)</Label>
              <Input
                id="pkg-validity"
                type="number"
                min="1"
                value={form.validity_days}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validity_days: e.target.value }))
                }
                placeholder="Ex: 90"
              />
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
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingUuid ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !loading && setDeleteOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir pacote</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeletingUuid(null);
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
