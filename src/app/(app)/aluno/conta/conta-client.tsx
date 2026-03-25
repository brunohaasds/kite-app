"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Calendar, Zap, Award, LogOut, Settings, Bell } from "@/lib/icons";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";

interface Props {
  user: { id: number; name: string; email: string; phone: string | null };
  level: string | null;
  totalSessions: number;
  activePackages: number;
}

export function ContaClient({ user, level, totalSessions, activePackages }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil atualizado!");
      setEditOpen(false);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {user.name[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {level && (
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {EXPERIENCE_LEVEL_LABELS[level] ?? level}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Calendar className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-bold">{totalSessions}</p>
          <p className="text-xs text-muted-foreground">Aulas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Zap className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-bold">{activePackages}</p>
          <p className="text-xs text-muted-foreground">Pacotes</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Award className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-bold">4.9</p>
          <p className="text-xs text-muted-foreground">Avaliação</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        <button
          onClick={() => setEditOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-left font-medium">Editar perfil</span>
        </button>

        <button
          disabled
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 shadow-sm opacity-50"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-left font-medium">Notificações</span>
          <span className="text-xs text-muted-foreground">Em breve</span>
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 shadow-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-left font-medium">Sair</span>
        </button>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" disabled={saving} onClick={handleSave}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
