"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/image-upload";
import { Award, Calendar, LogOut, Loader2 } from "@/lib/icons";

interface Props {
  instructor: {
    id: number;
    bio: string | null;
    avatar: string | null;
    certification: string | null;
    experience_years: number | null;
    extras: { certifications?: string[]; [key: string]: unknown } | null;
    user: { name: string; email: string; phone: string | null };
  };
  stats: { total: number; completed: number };
}

export function InstrutorContaClient({ instructor, stats }: Props) {
  const router = useRouter();
  const [bio, setBio] = useState(instructor.bio ?? "");
  const [phone, setPhone] = useState(instructor.user.phone ?? "");
  const [certification, setCertification] = useState(instructor.certification ?? "");
  const [experienceYears, setExperienceYears] = useState(
    instructor.experience_years != null ? String(instructor.experience_years) : "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(instructor.bio ?? "");
    setPhone(instructor.user.phone ?? "");
    setCertification(instructor.certification ?? "");
    setExperienceYears(
      instructor.experience_years != null ? String(instructor.experience_years) : "",
    );
  }, [instructor]);

  async function persistUpdate(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/instructors/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: instructor.id, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Erro ao salvar");
    }
  }

  async function handleAvatarUpload(url: string) {
    try {
      await persistUpdate({ avatar: url });
      toast.success("Avatar atualizado!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar avatar");
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const exp =
        experienceYears.trim() === "" ? undefined : Number.parseInt(experienceYears, 10);
      if (experienceYears.trim() !== "" && (Number.isNaN(exp) || exp! < 0)) {
        toast.error("Anos de experiência inválidos");
        return;
      }

      await persistUpdate({
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        certification: certification.trim() || undefined,
        experience_years: exp,
      });
      toast.success("Perfil atualizado!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const extraCerts = instructor.extras?.certifications ?? [];
  const mainCertLabel = certification.trim() || instructor.certification;
  const expParsed =
    experienceYears.trim() === ""
      ? null
      : Number.parseInt(experienceYears, 10);
  const showExpBadge =
    expParsed != null && !Number.isNaN(expParsed) && expParsed > 0;

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 mb-6 rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
        <div className="flex items-start gap-4">
          <ImageUpload
            currentImageUrl={instructor.avatar}
            onUpload={handleAvatarUpload}
            context="instructors"
            entityId={String(instructor.id)}
            size="lg"
            className="[&_button]:border-white/30"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{instructor.user.name}</h1>
            <p className="text-sm opacity-90">{instructor.user.email}</p>
            {bio.trim() ? (
              <p className="mt-2 text-sm leading-relaxed opacity-95">{bio}</p>
            ) : (
              <p className="mt-2 text-sm italic opacity-75">Sem biografia ainda.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Calendar className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Aulas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Award className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Aulas Concluídas</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Certificações</h2>
        <div className="flex flex-wrap gap-2">
          {mainCertLabel ? (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3.5 w-3.5" />
              {mainCertLabel}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Nenhuma certificação principal.</span>
          )}
          {extraCerts.map((c) => (
            <Badge key={c} variant="outline">
              {c}
            </Badge>
          ))}
        </div>
        {showExpBadge && (
          <Badge variant="secondary" className="mt-1">
            {expParsed} {expParsed === 1 ? "ano" : "anos"} de experiência
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="font-semibold">Editar perfil</h2>
        <div className="space-y-2">
          <Label htmlFor="instrutor-bio">Bio</Label>
          <textarea
            id="instrutor-bio"
            className="flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Sobre você..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instrutor-phone">Telefone</Label>
          <Input
            id="instrutor-phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instrutor-cert">Certificação principal</Label>
          <Input
            id="instrutor-cert"
            placeholder="Ex.: IKO Level 2"
            value={certification}
            onChange={(e) => setCertification(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instrutor-exp">Anos de experiência</Label>
          <Input
            id="instrutor-exp"
            type="number"
            min={0}
            placeholder="0"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
