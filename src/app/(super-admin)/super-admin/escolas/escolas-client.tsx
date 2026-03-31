"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Store,
  Users,
  Award,
  MapPin,
  LogIn,
  Search,
  Plus,
  Pencil,
  Loader2,
} from "@/lib/icons";
import { ImageUpload } from "@/components/shared/image-upload";
import { slugify } from "@/lib/slug";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "./actions";

export interface OrgRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  site: string | null;
  instagram: string | null;
  avatar: string | null;
  hero_image: string | null;
  whatsapp: string | null;
  studentCount: number;
  instructorCount: number;
  spotCount: number;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  site: "",
  instagram: "",
  avatar: "",
  hero_image: "",
  whatsapp: "",
};

export function EscolasClient({
  organizations,
}: {
  organizations: OrgRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OrgRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((o) => o.name.toLowerCase().includes(q));
  }, [organizations, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(org: OrgRow) {
    setEditing(org);
    setForm({
      name: org.name,
      slug: org.slug,
      description: org.description ?? "",
      site: org.site ?? "",
      instagram: org.instagram ?? "",
      avatar: org.avatar ?? "",
      hero_image: org.hero_image ?? "",
      whatsapp: org.whatsapp ?? "",
    });
    setFormOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      ...(!editing
        ? { slug: name.trim() ? slugify(name) : "" }
        : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nameTrim = form.name.trim();
    if (!nameTrim) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: nameTrim,
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        site: form.site.trim(),
        instagram: form.instagram.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
        hero_image: form.hero_image.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
      };

      const result = editing
        ? await updateOrganizationAction(editing.id, payload)
        : await createOrganizationAction(payload);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Escola atualizada" : "Escola criada");
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escolas</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre e edite escolas; entre como admin para configurar a
            operação.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="shrink-0 gap-2 bg-super-admin hover:bg-super-admin/90"
        >
          <Plus className="h-4 w-4" />
          Nova escola
        </Button>
      </div>

      {organizations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da escola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma escola cadastrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie a primeira escola com o botão acima.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma escola encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente outro termo de busca.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-super-admin/10 text-super-admin">
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
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{org.name}</span>
                    <p className="text-xs text-muted-foreground truncate">
                      /{org.slug}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
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
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Editar escola"
                    onClick={() => openEdit(org)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar escola</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Entrar como admin desta escola"
                    onClick={() => handleEnterAsAdmin(org.id)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="sr-only">Entrar como admin</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => !saving && setFormOpen(open)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar escola" : "Nova escola"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados e imagens da escola."
                : "Cadastre uma nova escola no sistema."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-start gap-2">
              <Label>Logo da escola</Label>
              <ImageUpload
                key={`logo-${editing?.id ?? "new"}`}
                currentImageUrl={form.avatar || null}
                onUpload={(url) => setForm((f) => ({ ...f, avatar: url }))}
                context="organizations"
                purpose="logo"
                entityId={editing ? String(editing.id) : undefined}
                size="lg"
                description={
                  editing
                    ? "PNG, JPEG ou WebP até 2 MB."
                    : "Pode enviar antes de criar (armazenamento temporário); a URL é associada à escola ao salvar."
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Imagem de fundo do hero</Label>
              <ImageUpload
                key={`hero-${editing?.id ?? "new"}`}
                currentImageUrl={form.hero_image || null}
                onUpload={(url) => setForm((f) => ({ ...f, hero_image: url }))}
                context="organizations"
                purpose="hero"
                entityId={editing ? String(editing.id) : undefined}
                variant="cover"
                description="Atrás do título na página pública (/escola/...). Paisagem recomendada. PNG, JPEG ou WebP até 2 MB."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome</Label>
                <Input
                  id="org-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="Nome da escola"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug (URL)</Label>
                <Input
                  id="org-slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder={
                    editing
                      ? "slug-da-escola"
                      : "Gerado do nome; pode editar"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Usado em /escola/seu-slug. Só letras minúsculas, números e
                  hífens.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-desc">Descrição</Label>
              <Textarea
                id="org-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Opcional"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-wa">WhatsApp</Label>
                <Input
                  id="org-wa"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, whatsapp: e.target.value }))
                  }
                  placeholder="+55..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-ig">Instagram</Label>
                <Input
                  id="org-ig"
                  value={form.instagram}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instagram: e.target.value }))
                  }
                  placeholder="@escola ou URL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-site">Site</Label>
              <Input
                id="org-site"
                type="url"
                value={form.site}
                onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? "Salvar alterações" : "Criar escola"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
