"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Store } from "@/lib/icons";
import { ImageUpload } from "@/components/shared/image-upload";

interface OrgData {
  id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
}

export function EscolaClient({ org }: { org: OrgData }) {
  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description ?? "");
  const [avatar, setAvatar] = useState(org.avatar ?? "");
  const [whatsapp, setWhatsapp] = useState(org.whatsapp ?? "");
  const [instagram, setInstagram] = useState(org.instagram ?? "");
  const [site, setSite] = useState(org.site ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/escola/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          avatar: avatar.trim() || null,
          whatsapp: whatsapp.trim() || null,
          instagram: instagram.trim() || null,
          site: site.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      toast.success("Configurações salvas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações da Escola</h1>
        <p className="text-muted-foreground text-sm">
          Informações que aparecem na página pública da escola
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="flex flex-col items-center gap-2">
          <Label>Logo da escola</Label>
          <ImageUpload
            currentImageUrl={avatar || null}
            onUpload={(url) => setAvatar(url)}
            context="organizations"
            entityId={String(org.id)}
            size="lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-name">Nome da escola</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da escola"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-desc">Descrição</Label>
          <textarea
            id="org-desc"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Sobre a escola..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="org-whatsapp">WhatsApp</Label>
            <Input
              id="org-whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="5585999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-instagram">Instagram</Label>
            <Input
              id="org-instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@escola"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-site">Site</Label>
          <Input
            id="org-site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="https://www.escola.com.br"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Store className="mr-2 h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
      </form>
    </div>
  );
}
