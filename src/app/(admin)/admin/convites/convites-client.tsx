"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Check, Clock, Loader2, Copy } from "@/lib/icons";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";

interface InviteRow {
  id: number;
  uuid: string;
  token: string;
  email: string;
  status: string;
  invitedByName: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800" },
  accepted: { label: "Aceito", className: "bg-green-100 text-green-800" },
  expired: { label: "Expirado", className: "bg-slate-100 text-slate-600" },
};

export function ConvitesClient({
  invites: initialInvites,
  orgId,
}: {
  invites: InviteRow[];
  orgId: number;
}) {
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), orgId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao enviar convite");
        return;
      }

      toast.success(`Convite enviado para ${email}`);
      setEmail("");

      setInvites((prev) => [
        {
          id: data.invite.id,
          uuid: data.invite.uuid,
          token: data.invite.token,
          email: data.invite.email,
          status: "pending",
          invitedByName: data.invite.invitedByName,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
          accepted_at: null,
        },
        ...prev,
      ]);
    } catch {
      toast.error("Erro ao enviar convite");
    } finally {
      setSending(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function isExpired(inv: InviteRow) {
    return inv.status === "pending" && new Date(inv.expires_at) < new Date();
  }

  function copyInviteUrl(invToken: string) {
    const url = `${window.location.origin}/convite/${invToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  return (
    <div className="space-y-6">
      <AdminSchoolPageHeader
        title="Convites"
        subtitle="Envie convites por email para novos alunos"
      />

      <form
        onSubmit={handleSend}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" disabled={sending}>
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </form>

      {invites.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhum convite enviado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Envie o primeiro convite acima.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {invites.map((inv) => {
            const expired = isExpired(inv);
            const statusInfo = expired
              ? STATUS_MAP.expired
              : STATUS_MAP[inv.status] ?? STATUS_MAP.pending;

            return (
              <div
                key={inv.uuid}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{inv.email}</span>
                      <Badge
                        variant="secondary"
                        className={statusInfo.className}
                      >
                        {expired ? (
                          <Clock className="mr-1 h-3 w-3" />
                        ) : inv.status === "accepted" ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : null}
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span>Enviado: {formatDate(inv.created_at)}</span>
                      <span>Expira: {formatDate(inv.expires_at)}</span>
                      <span>Por: {inv.invitedByName}</span>
                    </div>
                  </div>
                  {inv.status === "pending" && !expired && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => copyInviteUrl(inv.token)}
                      title="Copiar link do convite"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
