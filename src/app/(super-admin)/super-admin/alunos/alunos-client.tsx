"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, User } from "@/lib/icons";
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

  const filtered = useMemo(() => {
    if (filterOrgId === "all") return students;
    return students.filter(
      (s) => s.organizationId === parseInt(filterOrgId, 10),
    );
  }, [students, filterOrgId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} alunos{" "}
            {filterOrgId !== "all" ? "nesta escola" : "no total"}
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <div
              key={student.uuid}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/10 text-violet-600 shrink-0">
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
