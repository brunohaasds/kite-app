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
import { ArrowLeft, Plus, Trash2, Copy, Check, Calendar, Clock, Loader2, MapPin, Pencil } from "@/lib/icons";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface SlotItem {
  id: string;
  time: string;
  instructorId: string;
  spotId: string;
}

type CreationMode = "auto" | "manual";

const DAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

const DURATION_OPTIONS = [
  { value: "60", label: "1 hora" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 horas" },
  { value: "150", label: "2h30" },
  { value: "180", label: "3 horas" },
];

export function NovaAgendaClient({
  instructors,
  spots,
  existingAgendas,
}: {
  instructors: Instructor[];
  spots: Spot[];
  existingAgendas: ExistingAgenda[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [dayName, setDayName] = useState("");
  const [mode, setMode] = useState<CreationMode>("auto");
  const [slotsItems, setSlotsItems] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteAgenda, setDeleteAgenda] = useState<ExistingAgenda | null>(null);
  const [deletingAgenda, setDeletingAgenda] = useState(false);

  // Auto mode fields
  const [autoStart, setAutoStart] = useState("08:00");
  const [autoLessons, setAutoLessons] = useState("4");
  const [autoDuration, setAutoDuration] = useState("120");
  const [autoInstructorId, setAutoInstructorId] = useState("");
  const [autoSpotId, setAutoSpotId] = useState("");

  function handleDateChange(value: string) {
    setDate(value);
    if (value) {
      const d = new Date(value + "T12:00:00");
      setDayName(DAY_NAMES[d.getDay()] ?? "");
    } else {
      setDayName("");
    }
  }

  function generateAutoSlots() {
    const lessons = Number(autoLessons);
    const duration = Number(autoDuration);
    if (lessons <= 0 || lessons > 20) {
      toast.error("Número de aulas deve ser entre 1 e 20");
      return;
    }
    if (!autoStart) {
      toast.error("Defina o horário de início");
      return;
    }

    const [sh, sm] = autoStart.split(":").map(Number);
    let currentMin = sh * 60 + sm;

    const newSlots: SlotItem[] = [];
    for (let i = 0; i < lessons; i++) {
      const hh = String(Math.floor(currentMin / 60)).padStart(2, "0");
      const mm = String(currentMin % 60).padStart(2, "0");
      newSlots.push({
        id: crypto.randomUUID(),
        time: `${hh}:${mm}`,
        instructorId: autoInstructorId,
        spotId: autoSpotId,
      });
      currentMin += duration;
    }

    setSlotsItems(newSlots);
    toast.success(`${newSlots.length} horários gerados`);
  }

  function addManualSlot() {
    setSlotsItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), time: "", instructorId: "", spotId: "" },
    ]);
  }

  function removeSlot(id: string) {
    setSlotsItems((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: string, field: keyof SlotItem, value: string) {
    setSlotsItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handlePublish() {
    if (!date || !dayName || slotsItems.length === 0) {
      toast.error("Preencha a data e adicione pelo menos um horário");
      return;
    }
    const invalid = slotsItems.filter((s) => !s.time);
    if (invalid.length > 0) {
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
          slots: slotsItems.map((s) => ({
            time: s.time,
            instructorId: s.instructorId ? Number(s.instructorId) : null,
            spotId: s.spotId ? Number(s.spotId) : null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar agenda");
      }

      toast.success("Agenda publicada!");
      router.refresh();
      setDate("");
      setDayName("");
      setSlotsItems([]);
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

  async function handleDeleteAgenda() {
    if (!deleteAgenda) return;
    setDeletingAgenda(true);
    try {
      const res = await fetch("/api/admin/agendas/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: deleteAgenda.uuid }),
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      toast.success("Agenda excluída");
      setDeleteAgenda(null);
      router.refresh();
    } catch {
      toast.error("Erro ao excluir agenda");
    } finally {
      setDeletingAgenda(false);
    }
  }

  const endTime = slotsItems.length > 0
    ? (() => {
        const last = slotsItems[slotsItems.length - 1];
        const [h, m] = last.time.split(":").map(Number);
        const end = h * 60 + m + Number(autoDuration);
        return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
      })()
    : null;

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
        {/* Date */}
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

        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === "auto" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("auto")}
          >
            Grade Automática
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            Manual
          </Button>
        </div>

        {mode === "auto" ? (
          <div className="space-y-4 rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">
              Defina quantidade, duração e horário de início para gerar a grade automaticamente.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Nº de aulas</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={autoLessons}
                  onChange={(e) => setAutoLessons(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duração</Label>
                <Select value={autoDuration} onValueChange={setAutoDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Início</Label>
                <Input
                  type="time"
                  value={autoStart}
                  onChange={(e) => setAutoStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instrutor</Label>
                <Select value={autoInstructorId} onValueChange={setAutoInstructorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {spots.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">Spot</Label>
                <Select value={autoSpotId} onValueChange={setAutoSpotId}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {spots.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={generateAutoSlots} className="w-full">
              Gerar Grade
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button variant="outline" size="sm" onClick={addManualSlot}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Horário
            </Button>
          </div>
        )}

        {/* Slot Preview / Editor */}
        {slotsItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Horários ({slotsItems.length})</Label>
                {endTime && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {slotsItems[0].time} – {endTime}
                  </p>
                )}
              </div>
              {mode === "auto" && (
                <Button variant="outline" size="sm" onClick={addManualSlot}>
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {slotsItems.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(slot.id, "time", e.target.value)}
                    className="w-24"
                  />
                  <Select
                    value={slot.instructorId}
                    onValueChange={(v) => updateSlot(slot.id, "instructorId", v)}
                  >
                    <SelectTrigger className="flex-1 min-w-0">
                      <SelectValue placeholder="Instrutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {spots.length > 0 && (
                    <Select
                      value={slot.spotId}
                      onValueChange={(v) => updateSlot(slot.id, "spotId", v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Spot" />
                      </SelectTrigger>
                      <SelectContent>
                        {spots.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
          </div>
        )}

        <Button onClick={handlePublish} disabled={loading || slotsItems.length === 0} className="w-full">
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
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => copySlug(a.slug)}>
                  {copiedSlug === a.slug ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteAgenda(a)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Agenda Confirmation */}
      <Dialog open={!!deleteAgenda} onOpenChange={(open) => !deletingAgenda && !open && setDeleteAgenda(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir agenda</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta agenda e todos seus horários? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAgenda(null)} disabled={deletingAgenda}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgenda} disabled={deletingAgenda}>
              {deletingAgenda && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
