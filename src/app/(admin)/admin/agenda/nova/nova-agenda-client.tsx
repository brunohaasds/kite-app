"use client";

import { useMemo, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Clock,
  Loader2,
  Eye,
} from "@/lib/icons";
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
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";
import { formatDateFromIso } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

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

type PreviewDateBlock = {
  date: string;
  dayName: string;
  byInstructor: {
    instructorId: number;
    instructorName: string;
    slots: SlotItem[];
  }[];
};

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

function dayNameFromIso(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()] ?? "";
}

function generateSlotsForInstructor(
  start: string,
  durationMin: number,
  lessons: number,
  instructorId: string,
  spotId: string,
): SlotItem[] {
  const [sh, sm] = start.split(":").map(Number);
  let currentMin = sh * 60 + sm;
  const slots: SlotItem[] = [];
  for (let i = 0; i < lessons; i++) {
    const hh = String(Math.floor(currentMin / 60)).padStart(2, "0");
    const mm = String(currentMin % 60).padStart(2, "0");
    slots.push({
      id: crypto.randomUUID(),
      time: `${hh}:${mm}`,
      instructorId,
      spotId,
    });
    currentMin += durationMin;
  }
  return slots;
}

function mergeSlotsForApi(block: PreviewDateBlock) {
  const flat = block.byInstructor.flatMap((b) =>
    b.slots.map((s) => ({
      time: s.time,
      instructorId: s.instructorId ? Number(s.instructorId) : null,
      spotId: s.spotId ? Number(s.spotId) : null,
    })),
  );
  flat.sort((a, b) => {
    const c = a.time.localeCompare(b.time);
    return c !== 0 ? c : (a.instructorId ?? 0) - (b.instructorId ?? 0);
  });
  return flat;
}

export function NovaAgendaClient({
  organizationId,
  organizationSlug,
  instructors,
  spots,
  existingAgendas,
}: {
  organizationId: number;
  organizationSlug: string;
  instructors: Instructor[];
  spots: Spot[];
  existingAgendas: ExistingAgenda[];
}) {
  const router = useRouter();
  const [dateRows, setDateRows] = useState<string[]>(() => {
    const t = new Date();
    return [t.toISOString().slice(0, 10)];
  });
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<number[]>([]);
  const [spotId, setSpotId] = useState("");
  const [autoStart, setAutoStart] = useState("08:00");
  const [autoLessons, setAutoLessons] = useState("4");
  const [autoDuration, setAutoDuration] = useState("120");
  const [preview, setPreview] = useState<PreviewDateBlock[] | null>(null);
  const [previewTab, setPreviewTab] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copiedAgendaUuid, setCopiedAgendaUuid] = useState<string | null>(null);
  const [deleteAgenda, setDeleteAgenda] = useState<ExistingAgenda | null>(null);
  const [deletingAgenda, setDeletingAgenda] = useState(false);

  const [viewDialog, setViewDialog] = useState<ExistingAgenda | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSlots, setViewSlots] = useState<
    {
      time: string;
      instructorId: number | null;
      instructorName: string;
      spotName: string | null;
    }[]
  >([]);
  const [viewTab, setViewTab] = useState<string>("");

  function toggleInstructor(id: number) {
    setSelectedInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addDateRow() {
    setDateRows((prev) => [...prev, ""]);
  }

  function removeDateRow(index: number) {
    setDateRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function setDateAt(index: number, value: string) {
    setDateRows((prev) => prev.map((d, i) => (i === index ? value : d)));
  }

  function generatePreview() {
    const dates = dateRows.map((d) => d.trim()).filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort();

    if (uniqueDates.length === 0) {
      toast.error("Adicione pelo menos uma data");
      return;
    }
    if (selectedInstructorIds.length === 0) {
      toast.error("Selecione pelo menos um instrutor");
      return;
    }

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

    const instList = instructors.filter((i) => selectedInstructorIds.includes(i.id));
    const spotStr = spotId;

    const blocks: PreviewDateBlock[] = uniqueDates.map((dateStr) => {
      const dayName = dayNameFromIso(dateStr);
      const byInstructor = instList.map((inst) => ({
        instructorId: inst.id,
        instructorName: inst.name,
        slots: generateSlotsForInstructor(
          autoStart,
          duration,
          lessons,
          String(inst.id),
          spotStr,
        ),
      }));
      return { date: dateStr, dayName, byInstructor };
    });

    setPreview(blocks);
    setPreviewTab(String(instList[0]?.id ?? ""));
    toast.success("Pré-visualização gerada");
  }

  function endTimeForSlots(slots: SlotItem[], durationMin: number) {
    if (slots.length === 0) return null;
    const last = slots[slots.length - 1];
    const [h, m] = last.time.split(":").map(Number);
    const end = h * 60 + m + durationMin;
    return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
  }

  async function handlePublish() {
    if (!preview || preview.length === 0) {
      toast.error("Gere a pré-visualização primeiro");
      return;
    }

    setLoading(true);
    let ok = 0;
    const fails: string[] = [];

    try {
      for (const block of preview) {
        const slots = mergeSlotsForApi(block);
        try {
          const res = await fetch("/api/admin/agendas/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: block.date,
              dayName: block.dayName,
              slots,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(
              typeof data.error === "string" ? data.error : "Erro ao criar agenda",
            );
          }
          ok++;
        } catch (e) {
          fails.push(
            `${block.date}: ${e instanceof Error ? e.message : "Erro"}`,
          );
        }
      }

      if (ok > 0) {
        toast.success(
          ok === 1
            ? "1 agenda publicada"
            : `${ok} agendas publicadas`,
        );
        setPreview(null);
        router.refresh();
      }
      if (fails.length > 0) {
        toast.error(fails.join(" · "));
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyPublicAgendaUrl(agenda: ExistingAgenda) {
    const url = `${window.location.origin}/escola/${organizationSlug}/agenda`;
    await navigator.clipboard.writeText(url);
    setCopiedAgendaUuid(agenda.uuid);
    toast.success("Link da agenda copiado!");
    setTimeout(() => setCopiedAgendaUuid(null), 2000);
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

  async function openViewAgenda(a: ExistingAgenda) {
    setViewDialog(a);
    setViewLoading(true);
    setViewSlots([]);
    try {
      const res = await fetch(`/api/admin/agendas/detail?uuid=${encodeURIComponent(a.uuid)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      const slots = data.slots as {
        time: string;
        instructorId: number | null;
        instructorName: string;
        spotName: string | null;
      }[];
      setViewSlots(slots);
      const ids = [...new Set(slots.map((s) => s.instructorId ?? -1))];
      setViewTab(String(ids[0] ?? ""));
    } catch {
      toast.error("Não foi possível carregar a agenda");
      setViewDialog(null);
    } finally {
      setViewLoading(false);
    }
  }

  const viewGroups = useMemo(() => {
    const m = new Map<
      number,
      { name: string; rows: { time: string; spotName: string | null }[] }
    >();
    for (const s of viewSlots) {
      const key = s.instructorId ?? -1;
      if (!m.has(key)) {
        m.set(key, { name: s.instructorName, rows: [] });
      }
      m.get(key)!.rows.push({ time: s.time, spotName: s.spotName });
    }
    return [...m.entries()].sort((a, b) =>
      a[1].name.localeCompare(b[1].name, "pt-BR"),
    );
  }, [viewSlots]);

  const previewInstructors = preview?.[0]?.byInstructor ?? [];

  const durationMin = Number(autoDuration);

  return (
    <div className="space-y-6">
      <AdminSchoolPageHeader
        title="Nova Agenda"
        subtitle="Grade automática (uma ou mais datas e instrutores)"
        start={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/agenda">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Definição da grade</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha as datas, os instrutores (cada um recebe a mesma sequência de horários),
            início e duração única para toda a grade, e quantidade de aulas.
          </p>
        </div>

        {/* Datas dentro da grade */}
        <div className="space-y-3">
          <Label>Datas</Label>
          <div className="space-y-2">
            {dateRows.map((d, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  className="w-[calc(100%-3rem)] min-w-[200px] sm:max-w-xs"
                  value={d}
                  onChange={(e) => setDateAt(index, e.target.value)}
                />
                {dateRows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => removeDateRow(index)}
                    aria-label="Remover data"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addDateRow}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar outra data
          </Button>
        </div>

        {/* Instrutores multi */}
        <div className="space-y-2">
          <Label>Instrutores</Label>
          <p className="text-xs text-muted-foreground">
            Será gerada uma grade idêntica para cada instrutor selecionado.
          </p>
          {instructors.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Cadastre instrutores antes de criar agendas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {instructors.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => toggleInstructor(i.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                    selectedInstructorIds.includes(i.id)
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  {i.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="lessons">Nº de aulas</Label>
            <Input
              id="lessons"
              type="number"
              min={1}
              max={20}
              value={autoLessons}
              onChange={(e) => setAutoLessons(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Duração (toda a grade)</Label>
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
          <div className="space-y-2">
            <Label htmlFor="start">Início</Label>
            <Input
              id="start"
              type="time"
              value={autoStart}
              onChange={(e) => setAutoStart(e.target.value)}
            />
          </div>
          {spots.length > 0 && (
            <div className="space-y-2">
              <Label>Spot (opcional)</Label>
              <Select value={spotId || "__none__"} onValueChange={(v) => setSpotId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {spots.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={generatePreview}
          disabled={instructors.length === 0}
        >
          Gerar pré-visualização
        </Button>
      </div>

      {/* Pré-visualização com tabs por instrutor */}
      {preview && preview.length > 0 && previewInstructors.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pré-visualização</h2>
              <p className="text-sm text-muted-foreground">
                {preview.length} dia{preview.length !== 1 ? "s" : ""} ·{" "}
                {previewInstructors.length} instrutor
                {previewInstructors.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          <Tabs value={previewTab} onValueChange={setPreviewTab}>
            <TabsList className="w-full sm:w-auto">
              {previewInstructors.map((i) => (
                <TabsTrigger key={i.instructorId} value={String(i.instructorId)}>
                  {i.instructorName}
                </TabsTrigger>
              ))}
            </TabsList>

            {previewInstructors.map((i) => (
              <TabsContent
                key={i.instructorId}
                value={String(i.instructorId)}
                className="mt-4 space-y-4"
              >
                {preview.map((block) => {
                  const row = block.byInstructor.find(
                    (x) => x.instructorId === i.instructorId,
                  );
                  if (!row) return null;
                  const end = endTimeForSlots(row.slots, durationMin);
                  return (
                    <div
                      key={block.date}
                      className="rounded-lg border border-dashed bg-muted/30 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDateFromIso(block.date, {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({formatDateFromIso(block.date, { weekday: "long" })})
                        </span>
                      </div>
                      {row.slots.length > 0 && end && (
                        <p className="mb-1 text-xs text-muted-foreground">
                          {row.slots[0].time} – {end} (fim estimado após último slot)
                        </p>
                      )}
                      <ul className="space-y-1.5">
                        {row.slots.map((slot) => (
                          <li
                            key={slot.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-mono tabular-nums">{slot.time}</span>
                            {spots.length > 0 && slot.spotId && (
                              <span className="text-muted-foreground">
                                ·{" "}
                                {spots.find((s) => String(s.id) === slot.spotId)?.name ??
                                  "Spot"}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>

          <Button
            className="w-full"
            onClick={handlePublish}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar {preview.length > 1 ? `${preview.length} agendas` : "agenda"}
          </Button>
        </div>
      )}

      {existingAgendas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Agendas publicadas</h2>
          <p className="text-sm text-muted-foreground">
            Veja o resumo da grade por instrutor ou copie o link público da agenda.
          </p>
          {existingAgendas.map((a) => (
            <div
              key={a.uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDateFromIso(a.date, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({formatDateFromIso(a.date, { weekday: "long" })})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.slotCount} horários
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ver grade"
                  onClick={() => openViewAgenda(a)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Copiar link público da agenda"
                  onClick={() => copyPublicAgendaUrl(a)}
                >
                  {copiedAgendaUuid === a.uuid ? (
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

      <Dialog
        open={!!deleteAgenda}
        onOpenChange={(open) => !deletingAgenda && !open && setDeleteAgenda(null)}
      >
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

      <Dialog open={!!viewDialog} onOpenChange={(open) => !open && setViewDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade da agenda</DialogTitle>
            {viewDialog && (
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateFromIso(viewDialog.date, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </DialogDescription>
            )}
          </DialogHeader>

          {viewLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum horário.</p>
          ) : (
            <Tabs value={viewTab} onValueChange={setViewTab}>
              <TabsList className="w-full sm:w-auto">
                {viewGroups.map(([id, g]) => (
                  <TabsTrigger key={id} value={String(id)}>
                    {g.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {viewGroups.map(([id, g]) => (
                <TabsContent key={id} value={String(id)} className="mt-4 space-y-2">
                  <ul className="space-y-2">
                    {g.rows.map((r, idx) => (
                      <li
                        key={`${r.time}-${idx}`}
                        className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-mono tabular-nums">{r.time}</span>
                        {r.spotName && (
                          <span className="text-muted-foreground">· {r.spotName}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
