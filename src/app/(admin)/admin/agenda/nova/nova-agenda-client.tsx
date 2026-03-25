"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Copy, Check, Calendar, Clock, Loader2 } from "@/lib/icons";
import { toast } from "sonner";
import Link from "next/link";

interface Instructor {
  id: number;
  uuid: string;
  name: string;
}

interface Spot {
  id: number;
  uuid: string;
  name: string;
}

interface ExistingAgenda {
  uuid: string;
  slug: string;
  date: string;
  dayName: string;
  published: boolean;
  slotCount: number;
}

interface Slot {
  id: string;
  time: string;
  instructorId: string;
}

const DAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export function NovaAgendaClient({
  instructors,
  spots: _spots,
  existingAgendas,
}: {
  instructors: Instructor[];
  spots: Spot[];
  existingAgendas: ExistingAgenda[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [dayName, setDayName] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  function handleDateChange(value: string) {
    setDate(value);
    if (value) {
      const d = new Date(value + "T12:00:00");
      setDayName(DAY_NAMES[d.getDay()] ?? "");
    } else {
      setDayName("");
    }
  }

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), time: "", instructorId: "" },
    ]);
  }

  function removeSlot(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: string, field: "time" | "instructorId", value: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handlePublish() {
    if (!date || !dayName || slots.length === 0) {
      toast.error("Preencha a data e adicione pelo menos um horário");
      return;
    }

    const invalidSlots = slots.filter((s) => !s.time);
    if (invalidSlots.length > 0) {
      toast.error("Todos os horários devem estar preenchidos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/agendas/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          dayName,
          slots: slots.map((s) => ({
            time: s.time,
            instructorId: s.instructorId ? Number(s.instructorId) : null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar agenda");
      }

      toast.success("Agenda publicada com sucesso!");
      router.refresh();
      setDate("");
      setDayName("");
      setSlots([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar agenda");
    } finally {
      setLoading(false);
    }
  }

  async function copySlug(slug: string) {
    await navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    toast.success("Slug copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/agenda">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nova Agenda</h1>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Dia da semana</Label>
            <Input value={dayName} disabled placeholder="Selecione a data" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Horários</Label>
            <Button variant="outline" size="sm" onClick={addSlot}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum horário adicionado. Clique em &quot;Adicionar&quot; para começar.
            </p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(slot.id, "time", e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <Select
                    value={slot.instructorId}
                    onValueChange={(v) => updateSlot(slot.id, "instructorId", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Instrutor (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(slot.id)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handlePublish} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publicar Agenda
        </Button>
      </div>

      {existingAgendas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Agendas publicadas</h2>
          {existingAgendas.map((a) => (
            <div
              key={a.uuid}
              className="rounded-xl border bg-card p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {new Date(a.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({a.dayName})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{a.slotCount} horários</span>
                  <span>·</span>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    {a.slug}
                  </code>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copySlug(a.slug)}
              >
                {copiedSlug === a.slug ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
