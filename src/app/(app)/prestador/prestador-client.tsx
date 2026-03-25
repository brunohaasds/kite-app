"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BookingRow = {
  id: number;
  status: string;
  notes: string | null;
  created_at: string;
  student: {
    user: { name: string; email: string; phone: string | null };
  } | null;
  session: {
    date: string;
    start_time: string;
    organization: { name: string };
    spot: { name: string | null } | null;
  } | null;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export function PrestadorClient({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function updateStatus(id: number, status: "confirmed" | "cancelled") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/service-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao atualizar");
        return;
      }
      toast.success(status === "confirmed" ? "Pedido confirmado" : "Pedido cancelado");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nenhum pedido ainda. Quando um aluno solicitar seu serviço, aparece aqui.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="rounded-xl border bg-card p-4 shadow-sm space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">
                {b.student?.user.name ?? "Aluno (sem nome)"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(b.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                b.status === "requested"
                  ? "bg-amber-100 text-amber-800"
                  : b.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {STATUS_LABEL[b.status] ?? b.status}
            </span>
          </div>
          {b.session && (
            <p className="text-sm text-muted-foreground">
              Aula: {b.session.organization.name}
              {b.session.spot?.name ? ` · ${b.session.spot.name}` : ""} ·{" "}
              {new Date(b.session.date).toLocaleDateString("pt-BR")} às{" "}
              {b.session.start_time}
            </p>
          )}
          {b.notes && (
            <p className="text-sm border-l-2 pl-2 border-primary/30">{b.notes}</p>
          )}
          {b.status === "requested" && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={busyId === b.id}
                onClick={() => updateStatus(b.id, "confirmed")}
              >
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === b.id}
                onClick={() => updateStatus(b.id, "cancelled")}
              >
                Recusar
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
