"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  User,
  Phone,
  Shield,
} from "@/lib/icons";

type InviteState =
  | { kind: "loading" }
  | { kind: "valid"; email: string; orgName: string; invitedByName: string }
  | { kind: "error"; message: string };

export function ConviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<InviteState>({ kind: "loading" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();

        if (!res.ok) {
          const messages: Record<string, string> = {
            not_found: "Convite não encontrado.",
            already_used: "Este convite já foi utilizado.",
            expired: "Este convite expirou.",
          };
          setInvite({
            kind: "error",
            message: messages[data.error] ?? "Convite inválido.",
          });
          return;
        }

        setInvite({
          kind: "valid",
          email: data.email,
          orgName: data.orgName,
          invitedByName: data.invitedByName,
        });
      } catch {
        setInvite({ kind: "error", message: "Erro ao carregar convite." });
      }
    }
    load();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || undefined, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao aceitar convite");
        return;
      }

      setSuccess(true);

      const result = await signIn("credentials", {
        email: data.email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Conta criada! Redirecionando...");
        setTimeout(() => router.push("/aluno/aulas"), 1500);
      } else {
        toast.success("Conta criada! Faça login para continuar.");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      toast.error("Erro ao processar convite");
    } finally {
      setSubmitting(false);
    }
  }

  if (invite.kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (invite.kind === "error") {
    return (
      <div className="min-h-screen bg-background">
        <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
          <h1 className="mb-1 text-2xl font-bold">Convite</h1>
          <p className="text-sm opacity-90">Ops, algo deu errado</p>
        </div>
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
          <h2 className="text-xl font-semibold mb-2">Convite inválido</h2>
          <p className="text-muted-foreground mb-6">{invite.message}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
          <h1 className="mb-1 text-2xl font-bold">Bem-vindo!</h1>
          <p className="text-sm opacity-90">{invite.orgName}</p>
        </div>
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Conta criada!</h2>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
        <h1 className="mb-1 text-2xl font-bold">Aceitar Convite</h1>
        <p className="text-sm opacity-90">
          {invite.invitedByName} convidou você para {invite.orgName}
        </p>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        <div className="rounded-xl border bg-card p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email do convite</p>
              <p className="font-medium">{invite.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Criar conta e entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
