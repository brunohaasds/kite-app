"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Award, X } from "@/lib/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ImageUpload } from "@/components/shared/image-upload";

interface InstructorExtras {
  certifications?: string[];
  [key: string]: unknown;
}

interface InstructorRow {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  certification: string | null;
  experience_years: number | null;
  extras: InstructorExtras | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  avatar: string;
  certification: string;
  experience_years: string;
  certifications: string[];
}

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  bio: "",
  avatar: "",
  certification: "",
  experience_years: "",
  certifications: [],
};

export function InstrutoresClient({
  instructors: initial,
}: {
  instructors: InstructorRow[];
}) {
  const router = useRouter();
  const [instructors, setInstructors] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [newCert, setNewCert] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setNewCert("");
    setFormOpen(true);
  }

  function openEdit(inst: InstructorRow) {
    setEditingId(inst.id);
    setForm({
      name: inst.name,
      email: inst.email,
      phone: inst.phone ?? "",
      password: "",
      bio: inst.bio ?? "",
      avatar: inst.avatar ?? "",
      certification: inst.certification ?? "",
      experience_years: inst.experience_years?.toString() ?? "",
      certifications: inst.extras?.certifications ?? [],
    });
    setNewCert("");
    setFormOpen(true);
  }

  function addCertification() {
    const val = newCert.trim();
    if (val && !form.certifications.includes(val)) {
      setForm((f) => ({ ...f, certifications: [...f.certifications, val] }));
      setNewCert("");
    }
  }

  function removeCertification(cert: string) {
    setForm((f) => ({ ...f, certifications: f.certifications.filter((c) => c !== cert) }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!editingId && !form.email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    if (!editingId && form.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const extras: InstructorExtras = {};
      if (form.certifications.length > 0) extras.certifications = form.certifications;

      const endpoint = editingId
        ? "/api/admin/instructors/update"
        : "/api/admin/instructors/create";

      const body = editingId
        ? {
            id: editingId,
            name: form.name.trim(),
            phone: form.phone.trim() || undefined,
            bio: form.bio.trim() || undefined,
            avatar: form.avatar.trim() || undefined,
            certification: form.certification.trim() || undefined,
            experience_years: form.experience_years ? Number(form.experience_years) : undefined,
            extras: Object.keys(extras).length > 0 ? extras : undefined,
          }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            password: form.password,
            bio: form.bio.trim() || undefined,
            avatar: form.avatar.trim() || undefined,
            certification: form.certification.trim() || undefined,
            experience_years: form.experience_years ? Number(form.experience_years) : undefined,
            extras: Object.keys(extras).length > 0 ? extras : undefined,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro");
      }

      toast.success(editingId ? "Instrutor atualizado!" : "Instrutor criado!");
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instructors/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      setInstructors((prev) => prev.filter((i) => i.id !== deletingId));
      toast.success("Instrutor excluído!");
      setDeleteOpen(false);
      setDeletingId(null);
      router.refresh();
    } catch {
      toast.error("Erro ao excluir instrutor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instrutores</h1>
          <p className="text-muted-foreground text-sm">
            {instructors.length} instrutor{instructors.length !== 1 && "es"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </div>

      {instructors.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum instrutor</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Adicione o primeiro instrutor da escola.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {instructors.map((inst) => (
            <div key={inst.uuid} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <UserAvatar name={inst.name} imageUrl={inst.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{inst.name}</span>
                  {inst.bio && (
                    <p className="text-sm text-muted-foreground truncate">{inst.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inst.extras?.certifications?.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                    {inst.experience_years && (
                      <Badge variant="outline" className="text-xs">
                        {inst.experience_years} anos exp.
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(inst)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeletingId(inst.id);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !loading && setFormOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Instrutor" : "Novo Instrutor"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize as informações do instrutor" : "Preencha os dados do novo instrutor"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUpload
                currentImageUrl={form.avatar || null}
                onUpload={(url) => setForm((f) => ({ ...f, avatar: url }))}
                context="instructors"
                entityId={editingId ? String(editingId) : null}
                size="lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            {!editingId && (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Sobre o instrutor..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certificação principal</Label>
                <Input
                  placeholder="IKO, ABKITE..."
                  value={form.certification}
                  onChange={(e) => setForm((f) => ({ ...f, certification: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Anos de experiência</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.experience_years}
                  onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Certificações extras</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar certificação"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addCertification(); }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addCertification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1 pr-1">
                      {cert}
                      <button onClick={() => removeCertification(cert)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => !loading && setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir instrutor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este instrutor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteOpen(false); setDeletingId(null); }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
