"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKey } from "@/lib/styles/status-colors";
import { formatTime, whatsappLink } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  Wind,
  MapPin,
  Plus,
  CheckCircle2,
  MessageCircle,
  X,
  Loader2,
} from "@/lib/icons";
import { toast } from "sonner";
import Link from "next/link";

interface SessionRow {
  uuid: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: string;
  type: string | null;
  notes: string | null;
  studentName: string;
  studentPhone: string;
  instructorName: string;
  spotName: string;
}

interface AgendaClientProps {
  sessions: SessionRow[];
}

export function AgendaClient({ sessions: initialSessions }: AgendaClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "complete" | "cancel";
    session: SessionRow | null;
  }>({ open: false, action: "complete", session: null });
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  async function handleAction(action: "complete" | "cancel", uuid: string) {
    setLoading(true);
    try {
      const endpoint =
        action === "complete"
          ? "/api/admin/sessions/complete"
          : "/api/admin/sessions/cancel";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: uuid }),
      });
      if (!res.ok) throw new Error("Falha na operação");

      setSessions((prev) =>
        prev.map((s) =>
          s.uuid === uuid
            ? { ...s, status: action === "complete" ? "completed" : "cancelled" }
            : s,
        ),
      );
      toast.success(
        action === "complete" ? "Aula finalizada!" : "Aula cancelada!",
      );
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar sessão");
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: "complete", session: null });
    }
  }

  const activeSessions = sessions.filter(
    (s) => !["completed", "cancelled", "cancelled_weather", "cancelled_student"].includes(s.status),
  );
  const doneSessions = sessions.filter((s) =>
    ["completed", "cancelled", "cancelled_weather", "cancelled_student"].includes(s.status),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda do dia</h1>
          <p className="text-muted-foreground text-sm capitalize">{today}</p>
        </div>
        <Button asChild>
          <Link href="/admin/agenda/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Agenda
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma aula hoje</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crie uma nova agenda para começar a agendar aulas.
          </p>
        </div>
      ) : (
        <>
          {activeSessions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Pendentes ({activeSessions.length})
              </h2>
              {activeSessions.map((s) => (
                <SessionCard
                  key={s.uuid}
                  session={s}
                  onComplete={() =>
                    setConfirmDialog({ open: true, action: "complete", session: s })
                  }
                  onCancel={() =>
                    setConfirmDialog({ open: true, action: "cancel", session: s })
                  }
                />
              ))}
            </section>
          )}

          {doneSessions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Finalizadas ({doneSessions.length})
              </h2>
              {doneSessions.map((s) => (
                <SessionCard key={s.uuid} session={s} />
              ))}
            </section>
          )}
        </>
      )}

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !loading && setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "complete"
                ? "Finalizar aula"
                : "Cancelar aula"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "complete"
                ? `Confirma a finalização da aula de ${confirmDialog.session?.studentName}?`
                : `Confirma o cancelamento da aula de ${confirmDialog.session?.studentName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: "complete", session: null })
              }
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              variant={confirmDialog.action === "cancel" ? "destructive" : "default"}
              onClick={() =>
                confirmDialog.session &&
                handleAction(confirmDialog.action, confirmDialog.session.uuid)
              }
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmDialog.action === "complete" ? "Finalizar" : "Cancelar aula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionCard({
  session,
  onComplete,
  onCancel,
}: {
  session: SessionRow;
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const isDone = ["completed", "cancelled", "cancelled_weather", "cancelled_student"].includes(
    session.status,
  );

  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm ${isDone ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatTime(session.startTime)}
              {session.endTime && ` – ${formatTime(session.endTime)}`}
            </span>
            <StatusBadge status={session.status as StatusKey} />
          </div>

          <div className="flex items-center gap-1 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.studentName}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {session.instructorName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {session.spotName}
            </span>
          </div>
        </div>

        {!isDone && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {onComplete && (
              <Button size="sm" variant="outline" onClick={onComplete}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Finalizar
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={onCancel}>
                <X className="mr-1 h-3.5 w-3.5" />
                Cancelar
              </Button>
            )}
            {session.studentPhone && (
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={whatsappLink(session.studentPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-1 h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
