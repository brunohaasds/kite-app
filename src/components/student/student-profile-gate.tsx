"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { Loader2 } from "@/lib/icons";

export function StudentProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<string>("");

  useEffect(() => {
    if (!pathname.startsWith("/aluno")) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/session");
        const session = await r.json();
        if (!session?.user || session.user.role !== "student") {
          return;
        }
        const pr = await fetch("/api/user/profile-status");
        if (!pr.ok) return;
        const data = await pr.json();
        if (!cancelled && !data.complete) {
          setOpen(true);
        }
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleSave() {
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2 || digits.length < 10) {
      toast.error("Informe nome e telefone (mínimo 10 dígitos).");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        phone,
      };
      if (level) body.level = level;
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Não foi possível salvar.");
        return;
      }
      toast.success("Perfil atualizado!");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!pathname.startsWith("/aluno")) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete seu perfil</DialogTitle>
            <DialogDescription>
              Precisamos do seu nome e telefone para a escola entrar em contato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome completo</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">WhatsApp / telefone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(85) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label>Nível (opcional)</Label>
              <Select value={level || "__none__"} onValueChange={(v) => setLevel(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSave} disabled={saving || !checked}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar e continuar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
