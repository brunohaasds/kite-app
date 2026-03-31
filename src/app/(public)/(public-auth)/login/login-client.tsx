"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAppHomePath } from "@/lib/auth-routes";
import {
  AuthNovaShell,
  AuthNovaUnderlineField,
} from "@/components/marketing/auth-nova-shell";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail } from "@/lib/icons";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Email ou senha incorretos");
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role as string | undefined;
    router.push(getAppHomePath(role));
  }

  return (
    <AuthNovaShell>
      <h1 className="sr-only">Entrar na eKite</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Entrar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse com email e senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthNovaUnderlineField
          id="login-email"
          icon={Mail}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-2">
          <AuthNovaUnderlineField
            id="login-password"
            icon={KeyRound}
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end pt-1">
            <span
              className="text-xs text-muted-foreground"
              aria-disabled
              title="Em breve"
            >
              Esqueceu a senha?{" "}
              <span className="text-primary/60">Em breve</span>
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-full text-base font-semibold shadow-md"
        >
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>

      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo: admin@kiteapp.com / 123456
        </p>
      )}
    </AuthNovaShell>
  );
}
