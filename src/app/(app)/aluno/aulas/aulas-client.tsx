"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, User, MessageCircle } from "@/lib/icons";
import { whatsappLink } from "@/lib/utils";
import type { StatusKey } from "@/lib/styles/status-colors";

interface SessionData {
  id: number;
  uuid: string;
  date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  type: string | null;
  spotName: string | null;
  instructorName: string | null;
  instructorPhone: string | null;
}

interface Props {
  upcoming: SessionData[];
  past: SessionData[];
  cancelled: SessionData[];
}

export function AulasClient({ upcoming, past, cancelled }: Props) {
  const [contactSession, setContactSession] = useState<SessionData | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  const tabs = [
    { key: "upcoming" as const, label: "Próximas", count: upcoming.length },
    { key: "past" as const, label: "Concluídas", count: past.length },
    { key: "cancelled" as const, label: "Canceladas", count: cancelled.length },
  ];

  const currentList = activeTab === "upcoming" ? upcoming : activeTab === "past" ? past : cancelled;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  async function handleCancel(sessionId: number) {
    try {
      const res = await fetch("/api/sessions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Aula cancelada.");
      window.location.reload();
    } catch {
      toast.error("Erro ao cancelar aula.");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Minhas Aulas</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Nenhuma aula nesta categoria
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((s) => (
            <div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground capitalize">
                    {formatDate(s.date)}
                  </p>
                  <p className="text-lg font-bold">{s.start_time}</p>
                  {s.type && <p className="text-xs text-muted-foreground">{s.type}</p>}
                </div>
                <StatusBadge status={s.status as StatusKey} />
              </div>

              <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
                {s.spotName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> {s.spotName}
                  </div>
                )}
                {s.instructorName && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> {s.instructorName}
                  </div>
                )}
              </div>

              {activeTab === "upcoming" && (
                <div className="flex gap-2">
                  {s.instructorPhone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setContactSession(s)}
                    >
                      <MessageCircle className="mr-1 h-3.5 w-3.5" />
                      Contato
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancel(s.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact Dialog */}
      <Dialog open={!!contactSession} onOpenChange={() => setContactSession(null)}>
        <DialogContent className="max-w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle>Contato do instrutor</DialogTitle>
          </DialogHeader>
          {contactSession && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2 rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{contactSession.instructorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{formatDate(contactSession.date)} às {contactSession.start_time}</span>
                </div>
              </div>
              <a
                href={whatsappLink(
                  contactSession.instructorPhone!,
                  `Olá ${contactSession.instructorName}, sou aluno e tenho aula ${formatDate(contactSession.date)} às ${contactSession.start_time}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">Abrir WhatsApp</Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
