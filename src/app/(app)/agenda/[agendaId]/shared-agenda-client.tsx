"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, User, MapPin } from "@/lib/icons";

interface SlotData {
  id: number;
  time: string;
  booked: boolean;
  instructor: string | null;
  spotName: string | null;
}

interface Props {
  slots: SlotData[];
  rules: string[];
}

export function SharedAgendaClient({ slots: initialSlots, rules }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleBook(slotId: number) {
    try {
      const res = await fetch("/api/booking/slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      if (!res.ok) throw new Error();

      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, booked: true } : s)),
      );
      setDialogOpen(false);
      toast.success("Horário reservado com sucesso!");
    } catch {
      toast.error("Erro ao reservar. Tente novamente.");
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Horários disponíveis</h2>
      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => (
          <Dialog
            key={slot.id}
            open={dialogOpen && selectedSlot?.id === slot.id}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setSelectedSlot(null);
            }}
          >
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  if (!slot.booked) {
                    setSelectedSlot(slot);
                    setDialogOpen(true);
                  }
                }}
                disabled={slot.booked}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  slot.booked
                    ? "cursor-not-allowed border-border bg-secondary opacity-50"
                    : "cursor-pointer border-border bg-card hover:border-primary hover:shadow-md"
                }`}
              >
                <p className="text-2xl font-bold text-primary">{slot.time}</p>
                <div className="mt-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      slot.instructor
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {slot.instructor ?? "Aberto"}
                  </span>
                </div>
                {slot.booked && (
                  <span className="mt-2 block w-fit rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                    Ocupado
                  </span>
                )}
              </button>
            </DialogTrigger>
            {!slot.booked && selectedSlot && (
              <DialogContent className="max-w-[90%] rounded-xl">
                <DialogHeader>
                  <DialogTitle>Confirmar agendamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-3 rounded-lg bg-secondary p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horário</p>
                        <p className="font-semibold">{selectedSlot.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Instrutor</p>
                        <p className="font-semibold">
                          {selectedSlot.instructor ?? "A definir"}
                        </p>
                      </div>
                    </div>
                    {selectedSlot.spotName && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Local</p>
                          <p className="font-semibold">{selectedSlot.spotName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {rules.length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                      <p className="mb-3 text-sm font-semibold">Importante:</p>
                      <ul className="space-y-2">
                        {rules.map((rule, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleBook(selectedSlot.id)}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>
    </div>
  );
}
