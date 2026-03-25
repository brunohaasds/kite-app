"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserCircle, Search, Pencil, Mail, Phone } from "@/lib/icons";
import { USER_ROLE_LABELS } from "@/lib/constants";

const ROLE_FILTER_VALUES = [
  "all",
  "superadmin",
  "admin",
  "instructor",
  "student",
  "service_provider",
] as const;

interface UserRow {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  lastLoginAt: string | null;
  organizations: { id: number; name: string }[];
}

interface Org {
  id: number;
  name: string;
}

function formatLastLogin(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function roleBadgeVariant(
  role: string,
): "default" | "secondary" | "outline" | "destructive" {
  if (role === "superadmin") return "destructive";
  if (role === "admin") return "default";
  return "secondary";
}

export function UsuariosClient({
  users,
  organizations,
  currentUserId,
}: {
  users: UserRow[];
  organizations: Org[];
  currentUserId: number;
}) {
  const router = useRouter();
  const [filterOrgId, setFilterOrgId] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = users;
    if (filterRole !== "all") {
      list = list.filter((u) => u.role === filterRole);
    }
    if (filterOrgId !== "all") {
      const oid = parseInt(filterOrgId, 10);
      list = list.filter((u) =>
        u.organizations.some((o) => o.id === oid),
      );
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone?.toLowerCase().includes(q) ?? false) ||
        u.organizations.some((o) => o.name.toLowerCase().includes(q)),
    );
  }, [users, filterOrgId, filterRole, search]);

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditName(u.name);
    setEditPhone(u.phone ?? "");
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    const nameTrim = editName.trim();
    if (!nameTrim) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editing.id,
          name: nameTrim,
          phone: editPhone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao salvar");
      }
      toast.success("Usuário atualizado");
      setEditOpen(false);
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm">
          Todos os perfis do sistema (super admin, admin, instrutor, aluno,
          prestador). {filtered.length} de {users.length} usuários
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {ROLE_FILTER_VALUES.filter((r) => r !== "all").map((r) => (
              <SelectItem key={r} value={r}>
                {USER_ROLE_LABELS[r] ?? r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterOrgId} onValueChange={setFilterOrgId}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Escola" />
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

      {users.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou escola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <UserCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search.trim()
              ? "Tente outro termo ou ajuste os filtros."
              : users.length === 0
                ? "Não há usuários cadastrados."
                : "Tente ajustar perfil ou escola."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">
                    Telefone
                  </th>
                  <th className="px-4 py-3 font-medium">Perfil</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">
                    Escolas
                  </th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">
                    Último acesso
                  </th>
                  <th className="px-4 py-3 font-medium w-[100px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.uuid}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium">{u.name}</span>
                      <p className="text-xs text-muted-foreground md:hidden truncate max-w-[200px]">
                        {u.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top hidden lg:table-cell text-muted-foreground">
                      {u.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {u.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={roleBadgeVariant(u.role)}>
                        {USER_ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top hidden xl:table-cell max-w-[220px]">
                      {u.organizations.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="text-muted-foreground line-clamp-2">
                          {u.organizations.map((o) => o.name).join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {formatLastLogin(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {u.id === currentUserId ? (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Editar nome e telefone"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground break-all">
                {editing.email}
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={() => void saveEdit()} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
