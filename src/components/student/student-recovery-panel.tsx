"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Store } from "@/lib/icons";

export type StudentRecoveryVariant = "no_student" | "no_member" | "no_user";

const COPY: Record<
  StudentRecoveryVariant,
  { title: string; description: string; showCentersCta: boolean }
> = {
  no_student: {
    title: "Perfil de aluno ainda não ativado",
    description:
      "A sua conta existe, mas o perfil de aluno só é criado após o primeiro agendamento numa escola. Escolha uma escola e reserve um horário para ver as suas aulas e pacotes aqui.",
    showCentersCta: true,
  },
  no_member: {
    title: "Sem vínculo com escola",
    description:
      "Para convidar amigos ou ver benefícios de escola, é preciso estar associado a uma escola — por exemplo após agendar uma aula ou aceitar um convite da escola.",
    showCentersCta: true,
  },
  no_user: {
    title: "Conta não encontrada",
    description:
      "Não encontramos os seus dados de utilizador. Saia e entre novamente com outra conta, ou contacte o suporte se o problema continuar.",
    showCentersCta: false,
  },
};

export function StudentRecoveryPanel({ variant }: { variant: StudentRecoveryVariant }) {
  const { title, description, showCentersCta } = COPY[variant];

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3">
        {showCentersCta && (
          <Button asChild className="h-12 w-full gap-2">
            <Link href="/centers">
              <Store className="h-4 w-4 shrink-0" aria-hidden />
              Ver escolas e agendar
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-2 text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Sair
        </Button>
      </div>
    </div>
  );
}
