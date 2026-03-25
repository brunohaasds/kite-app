"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, User, Search } from "@/lib/icons";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";

interface StudentRow {
  id: number;
  uuid: string;
  name: string;
  email: string;
  level: string | null;
  organizationId: number;
  organizationName: string;
}

interface Org {
  id: number;
  name: string;
}

export function AlunosClient({
  students,
  organizations,
}: {
  students: StudentRow[];
  organizations: Org[];
}) {
  const [filterOrgId, setFilterOrgId] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list =
      filterOrgId === "all"
        ? students
        : students.filter(
            (s) => s.organizationId === parseInt(filterOrgId, 10),
          );
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.organizationName.toLowerCase().includes(q),
    );
  }, [students, filterOrgId, search]);

  const totalLabel =
    filterOrgId === "all" ? "no total" : "nesta escola";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} alunos {totalLabel}
          </p>
        </div>
        <Select value={filterOrgId} onValueChange={setFilterOrgId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por escola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as escolas</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={String(org.id)}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {students.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou escola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search.trim()
              ? "Tente outro termo de busca ou ajuste o filtro de escola."
              : students.length === 0
                ? "Não há alunos cadastrados."
                : "Tente ajustar o filtro de escola."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <div
              key={student.uuid}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-super-admin/10 text-super-admin shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{student.name}</span>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {student.organizationName}
                    </span>
                    {student.level && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {EXPERIENCE_LEVEL_LABELS[student.level] ??
                          student.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
