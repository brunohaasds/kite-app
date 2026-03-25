"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Phone, MessageCircle } from "@/lib/icons";
import { whatsappLink } from "@/lib/utils";

interface StudentRow {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  level: string;
}

const LEVEL_LABELS: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const LEVEL_CLASSES: Record<string, string> = {
  iniciante: "bg-blue-100 text-blue-800",
  intermediario: "bg-amber-100 text-amber-800",
  avancado: "bg-green-100 text-green-800",
};

export function AlunosClient({ students }: { students: StudentRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alunos</h1>
        <p className="text-muted-foreground text-sm">
          {students.length} aluno{students.length !== 1 && "s"} cadastrado
          {students.length !== 1 && "s"}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search
              ? "Tente buscar por outro nome."
              : "Nenhum aluno cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student) => (
            <div
              key={student.uuid}
              className="rounded-xl border bg-card p-4 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => router.push(`/admin/aluno/${student.uuid}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/admin/aluno/${student.uuid}`);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{student.name}</span>
                    <Badge
                      variant="secondary"
                      className={LEVEL_CLASSES[student.level] ?? "bg-slate-200 text-slate-700"}
                    >
                      {LEVEL_LABELS[student.level] ?? student.level}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </span>
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </span>
                    )}
                  </div>
                </div>
                {student.phone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(whatsappLink(student.phone), "_blank");
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
