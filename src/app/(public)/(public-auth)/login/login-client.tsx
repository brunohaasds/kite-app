"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAppHomePath } from "@/lib/auth-routes";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center gap-3">
          <h1 className="sr-only">Entrar na eKite</h1>
          <AppLogo size="lg" priority className="max-h-14" />
          <p className="text-sm text-muted-foreground">
            Gestão de escolas de kitesurf
          </p>
        </div>

        <p className="text-center text-sm">
          <a
            href="/cadastro"
            className="font-medium text-primary hover:underline"
          >
            Criar conta
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <p className="text-center text-xs text-muted-foreground">
            Demo: admin@kiteapp.com / 123456
          </p>
        )}
      </div>
    </div>
  );
}
