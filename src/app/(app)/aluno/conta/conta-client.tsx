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
import { Calendar, Zap, Award, LogOut, Settings, Bell, KeyRound } from "@/lib/icons";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ImageUpload } from "@/components/shared/image-upload";

interface Props {
  user: { id: number; name: string; email: string; phone: string | null };
  level: string | null;
  totalSessions: number;
  activePackages: number;
}

export function ContaClient({ user, level, totalSessions, activePackages }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Não foi possível alterar a senha.");
        return;
      }
      toast.success("Senha alterada com sucesso!");
      resetPasswordForm();
      setPasswordOpen(false);
    } catch {
      toast.error("Erro ao alterar a senha.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg -mx-4 -mt-4 mb-6">
        <div className="flex items-center gap-4">
          <ImageUpload
            currentImageUrl={null}
            onUpload={async (url) => {
              await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: url }),
              });
              toast.success("Avatar atualizado!");
            }}
            context="users"
            size="lg"
            className="[&_button]:border-white/30"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm opacity-90">{user.email}</p>
            {level && (
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {EXPERIENCE_LEVEL_LABELS[level] ?? level}
              </span>
            )}
          </div>
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
          type="button"
          onClick={() => {
            resetPasswordForm();
            setPasswordOpen(true);
          }}
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
        >
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-left font-medium">Alterar senha</span>
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

      <Dialog
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent className="max-w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="pwd-current">Senha atual</Label>
              <Input
                id="pwd-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-new">Nova senha</Label>
              <Input
                id="pwd-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-confirm">Confirmar nova senha</Label>
              <Input
                id="pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPasswordOpen(false);
                  resetPasswordForm();
                }}
              >
                Cancelar
              </Button>
              <Button className="flex-1" disabled={passwordSaving} onClick={handleChangePassword}>
                {passwordSaving ? "Salvando..." : "Salvar senha"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
