"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  User,
  Mail,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Loader2,
} from "@/lib/icons";
import { whatsappLink } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";

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

const LEVEL_OPTIONS = ["iniciante", "intermediario", "avancado"] as const;

export function AlunosClient({ students }: { students: StudentRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLevel, setEditLevel] = useState<string>("iniciante");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openEdit(s: StudentRow) {
    setEditStudent(s);
    setEditName(s.name);
    setEditPhone(s.phone);
    setEditLevel(s.level in LEVEL_LABELS ? s.level : "iniciante");
  }

  async function handleSaveEdit() {
    if (!editStudent) return;
    if (!editName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/students/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: editStudent.uuid,
          name: editName.trim(),
          phone: editPhone,
          level: editLevel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Erro ao atualizar");
      }
      toast.success("Aluno atualizado");
      setEditStudent(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/students/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: deleteTarget.uuid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Erro ao excluir");
      }
      toast.success("Aluno removido");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSchoolPageHeader
        title="Alunos"
        subtitle={`${students.length} aluno${students.length !== 1 ? "s" : ""} cadastrado${students.length !== 1 ? "s" : ""}`}
      />

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
              className="rounded-xl border bg-card p-4 shadow-sm hover:border-primary/30 transition-colors flex items-center gap-3"
            >
              <div
                className="flex flex-1 min-w-0 items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/admin/aluno/${student.uuid}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/admin/aluno/${student.uuid}`);
                }}
              >
                <UserAvatar name={student.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{student.name}</span>
                    <Badge
                      variant="secondary"
                      className={
                        LEVEL_CLASSES[student.level] ?? "bg-slate-200 text-slate-700"
                      }
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
              </div>
              <div className="flex items-center shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(student);
                  }}
                  aria-label="Editar aluno"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(student);
                  }}
                  aria-label="Excluir aluno"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

      <Dialog
        open={!!editStudent}
        onOpenChange={(open) => !saving && !open && setEditStudent(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar aluno</DialogTitle>
            <DialogDescription>
              Atualize nome, telefone e nível de experiência. O e-mail não pode ser alterado aqui.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label>Nível</Label>
              <Select value={editLevel} onValueChange={setEditLevel} disabled={saving}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {LEVEL_LABELS[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !deleting && !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir aluno</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> da
              escola? Esta ação pode ser revertida apenas pelo suporte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
