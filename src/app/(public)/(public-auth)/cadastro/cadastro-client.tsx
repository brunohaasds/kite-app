"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  AuthNovaShell,
  AuthNovaUnderlineField,
} from "@/components/marketing/auth-nova-shell";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail } from "@/lib/icons";

export function CadastroClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "email_exists") {
          toast.error("Este email já possui conta. Faça login.");
          return;
        }
        toast.error(data.error || "Erro ao criar conta");
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        toast.error("Conta criada. Faça login manualmente.");
        router.push("/login");
        return;
      }
      toast.success("Conta criada!");
      router.push("/aluno/aulas");
    } catch {
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthNovaShell>
      <h1 className="sr-only">Criar conta na eKite</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Nova conta
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Email e senha. Complete nome e telefone depois no app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthNovaUnderlineField
          id="cadastro-email"
          icon={Mail}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthNovaUnderlineField
          id="cadastro-password"
          icon={KeyRound}
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <AuthNovaUnderlineField
          id="cadastro-confirm"
          icon={KeyRound}
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-full text-base font-semibold shadow-md"
        >
          {loading ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthNovaShell>
  );
}
