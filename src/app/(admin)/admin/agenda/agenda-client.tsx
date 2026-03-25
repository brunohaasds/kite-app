"use client";

import { useEffect, useMemo, useState } from "react";
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
import { cn, formatCurrency, formatTime, whatsappLink } from "@/lib/utils";
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
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Trash2,
  UserPlus,
} from "@/lib/icons";
import { toast } from "sonner";
import Link from "next/link";
import { buildWeekDays } from "@/lib/date-utils";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SessionRow {
  uuid: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: string;
  type: string | null;
  notes: string | null;
  /** Quem marcou: aluno (app) ou admin (painel). */
  bookingSource: string;
  studentName: string;
  studentPhone: string;
  instructorName: string;
  spotName: string;
}

interface BookingStudentOption {
  id: number;
  name: string;
  email: string;
}

interface AvailableSlot {
  id: number;
  time: string;
  booked: boolean;
  instructorName: string;
  spotName: string | null;
}

interface AgendaClientProps {
  sessions: SessionRow[];
  currentDate: string;
  availableSlots?: AvailableSlot[];
  bookingStudents: BookingStudentOption[];
}

export function AgendaClient({
  sessions: initialSessions,
  currentDate,
  availableSlots = [],
  bookingStudents,
}: AgendaClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [slots, setSlots] = useState(availableSlots);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "complete" | "cancel";
    session: SessionRow | null;
  }>({ open: false, action: "complete", session: null });
  const [deleteSlotDialog, setDeleteSlotDialog] = useState<{ open: boolean; slot: AvailableSlot | null }>({ open: false, slot: null });
  const [loading, setLoading] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(false);
  /** Nomes dos instrutores com painel expandido (vários ao mesmo tempo). */
  const [openInstructors, setOpenInstructors] = useState<string[]>([]);

  const [bookSlot, setBookSlot] = useState<AvailableSlot | null>(null);
  const [bookStudentId, setBookStudentId] = useState("");
  const [lessonType, setLessonType] = useState<
    "avulsa" | "pacote_credito" | "pacote_novo"
  >("avulsa");
  const [studentPackageId, setStudentPackageId] = useState("");
  const [newPackageId, setNewPackageId] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [studentPackagesOpt, setStudentPackagesOpt] = useState<
    { id: number; title: string; sessionsRemaining: number }[]
  >([]);
  const [shopPackagesOpt, setShopPackagesOpt] = useState<
    { id: number; title: string; price: number; sessionCount: number }[]
  >([]);

  const slotsByInstructor = useMemo(() => {
    const map = new Map<string, AvailableSlot[]>();
    for (const s of slots) {
      const key = s.instructorName.trim() || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR"),
    );
  }, [slots]);

  useEffect(() => {
    if (slotsByInstructor.length === 0) {
      setOpenInstructors([]);
      return;
    }
    setOpenInstructors((prev) => {
      const valid = prev.filter((k) =>
        slotsByInstructor.some(([n]) => n === k),
      );
      if (valid.length > 0) return valid;
      return [slotsByInstructor[0][0]];
    });
  }, [currentDate, slotsByInstructor]);

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
    setSlots(availableSlots);
  }, [availableSlots]);

  useEffect(() => {
    if (!bookSlot || !bookStudentId) {
      setStudentPackagesOpt([]);
      setShopPackagesOpt([]);
      return;
    }
    let cancelled = false;
    setOptionsLoading(true);
    fetch(
      `/api/admin/students/booking-options?studentId=${encodeURIComponent(bookStudentId)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setStudentPackagesOpt(data.studentPackages ?? []);
        setShopPackagesOpt(data.shopPackages ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Erro ao carregar pacotes");
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookSlot, bookStudentId]);

  function openBookModal(slot: AvailableSlot) {
    setBookSlot(slot);
    setLessonType("avulsa");
    setStudentPackageId("");
    setNewPackageId("");
    setBookStudentId(
      bookingStudents[0]?.id != null ? String(bookingStudents[0].id) : "",
    );
  }

  function closeBookModal() {
    setBookSlot(null);
  }

  async function handleAdminBook() {
    if (!bookSlot || !bookStudentId) {
      toast.error("Selecione o aluno");
      return;
    }
    if (lessonType === "pacote_credito" && !studentPackageId) {
      toast.error("Selecione um pacote com crédito");
      return;
    }
    if (lessonType === "pacote_novo" && !newPackageId) {
      toast.error("Selecione um pacote para venda");
      return;
    }

    setBookingSubmitting(true);
    try {
      const body: {
        slotId: number;
        studentId: number;
        lessonType: "avulsa" | "pacote_credito" | "pacote_novo";
        studentPackageId?: number;
        packageId?: number;
      } = {
        slotId: bookSlot.id,
        studentId: Number(bookStudentId),
        lessonType,
      };
      if (lessonType === "pacote_credito") {
        body.studentPackageId = Number(studentPackageId);
      }
      if (lessonType === "pacote_novo") {
        body.packageId = Number(newPackageId);
      }

      const res = await fetch("/api/admin/sessions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Erro ao agendar",
        );
      }
      toast.success("Aula agendada!");
      const sid = bookSlot.id;
      closeBookModal();
      setSlots((prev) =>
        prev.map((s) => (s.id === sid ? { ...s, booked: true } : s)),
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao agendar");
    } finally {
      setBookingSubmitting(false);
    }
  }

  function toggleInstructorSlots(name: string) {
    setOpenInstructors((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  const weekDays = buildWeekDays(currentDate);

  function navigateToDate(date: string) {
    router.push(`/admin/agenda?date=${date}`);
  }

  function shiftWeek(direction: number) {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + direction * 7);
    navigateToDate(d.toISOString().split("T")[0]);
  }

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

  async function handleDeleteSlot() {
    if (!deleteSlotDialog.slot) return;
    setDeletingSlot(true);
    try {
      const res = await fetch("/api/admin/agendas/slots/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: deleteSlotDialog.slot.id }),
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      setSlots((prev) => prev.filter((s) => s.id !== deleteSlotDialog.slot!.id));
      toast.success("Horário excluído!");
      setDeleteSlotDialog({ open: false, slot: null });
      router.refresh();
    } catch {
      toast.error("Erro ao excluir horário");
    } finally {
      setDeletingSlot(false);
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
      <AdminSchoolPageHeader
        title="Agenda"
        desktopEnd={
          <Button asChild>
            <Link href="/admin/agenda/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Agenda
            </Link>
          </Button>
        }
      />

      {/* Day navigation */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => shiftWeek(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => navigateToDate(day.date)}
              className={`flex min-w-[60px] flex-1 flex-col items-center rounded-lg px-2 py-2 text-xs transition-colors ${
                day.date === currentDate
                  ? "bg-primary text-primary-foreground font-semibold"
                  : day.isToday
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="capitalize">{day.dayLabel}</span>
              <span className="text-[11px]">{day.label}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => shiftWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma aula neste dia</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crie uma nova agenda para começar a agendar aulas.
          </p>
        </div>
      ) : (
        <Tabs
          defaultValue={
            activeSessions.length > 0 ? "pendentes" : "finalizadas"
          }
          className="w-full"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pendentes">
              Pendentes ({activeSessions.length})
            </TabsTrigger>
            <TabsTrigger value="finalizadas">
              Finalizadas ({doneSessions.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pendentes" className="mt-4 space-y-3">
            {activeSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                Nenhuma aula pendente neste dia.
              </div>
            ) : (
              activeSessions.map((s) => (
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
              ))
            )}
          </TabsContent>
          <TabsContent value="finalizadas" className="mt-4 space-y-3">
            {doneSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                Nenhuma aula finalizada ou cancelada neste dia.
              </div>
            ) : (
              doneSessions.map((s) => (
                <SessionCard key={s.uuid} session={s} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Available Slots */}
      {slots.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Horários disponíveis ({slots.filter((s) => !s.booked).length} /{" "}
            {slots.length})
          </h2>
          <div className="space-y-2">
            {slotsByInstructor.map(([name, list]) => {
              const livres = list.filter((s) => !s.booked).length;
              const open = openInstructors.includes(name);
              return (
                <div
                  key={name}
                  className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleInstructorSlots(name)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    aria-expanded={open}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{name}</span>
                      <span className="ml-2 text-sm text-muted-foreground tabular-nums">
                        ({livres}/{list.length})
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {open ? (
                    <div className="border-t bg-muted/20 px-3 pb-3 pt-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {list.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm ${slot.booked ? "opacity-50" : ""}`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{slot.time}</p>
                              {slot.spotName ? (
                                <p className="truncate text-xs text-muted-foreground">
                                  {slot.spotName}
                                </p>
                              ) : null}
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${slot.booked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                            >
                              {slot.booked ? "Ocupado" : "Livre"}
                            </span>
                            {!slot.booked && (
                              <div className="flex shrink-0 items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-primary hover:bg-primary/10"
                                  title={
                                    bookingStudents.length === 0
                                      ? "Cadastre alunos na escola"
                                      : "Agendar aluno"
                                  }
                                  disabled={bookingStudents.length === 0}
                                  onClick={() => openBookModal(slot)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() =>
                                    setDeleteSlotDialog({ open: true, slot })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Dialog
        open={!!bookSlot}
        onOpenChange={(open) => !open && !bookingSubmitting && closeBookModal()}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar aluno</DialogTitle>
            <DialogDescription>
              {bookSlot ? (
                <>
                  Horário {bookSlot.time}
                  {bookSlot.instructorName
                    ? ` · ${bookSlot.instructorName}`
                    : ""}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {bookingStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há alunos cadastrados nesta escola. Cadastre alunos em Alunos.
            </p>
          ) : (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <Label htmlFor="book-student">Aluno</Label>
                <Select
                  value={bookStudentId}
                  onValueChange={setBookStudentId}
                >
                  <SelectTrigger id="book-student">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingStudents.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {s.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {optionsLoading && bookStudentId ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando pacotes…
                </div>
              ) : null}

              <div className="space-y-3">
                <Label>Tipo de aula</Label>
                <RadioGroup
                  value={lessonType}
                  onValueChange={(v) => {
                    setLessonType(
                      v as "avulsa" | "pacote_credito" | "pacote_novo",
                    );
                    setStudentPackageId("");
                    setNewPackageId("");
                  }}
                  className="gap-2"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="avulsa" id="lt-avulsa" />
                    Aula avulsa
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="pacote_credito" id="lt-cred" />
                    Usar crédito de pacote existente
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="pacote_novo" id="lt-novo" />
                    Comprar pacote novo (cobra 1 aula ao agendar)
                  </label>
                </RadioGroup>
              </div>

              {lessonType === "pacote_credito" && bookStudentId && (
                <div className="space-y-2">
                  <Label>Pacote com crédito</Label>
                  {studentPackagesOpt.length === 0 ? (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Nenhum pacote ativo com créditos.
                    </p>
                  ) : (
                    <Select
                      value={studentPackageId}
                      onValueChange={setStudentPackageId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pacote" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentPackagesOpt.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title} ({p.sessionsRemaining} restantes)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {lessonType === "pacote_novo" && bookStudentId && (
                <div className="space-y-2">
                  <Label>Pacote à venda</Label>
                  {shopPackagesOpt.length === 0 ? (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Nenhum pacote ativo cadastrado.
                    </p>
                  ) : (
                    <Select
                      value={newPackageId}
                      onValueChange={setNewPackageId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pacote" />
                      </SelectTrigger>
                      <SelectContent>
                        {shopPackagesOpt.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title} · {p.sessionCount} aulas ·{" "}
                            {formatCurrency(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeBookModal}
              disabled={bookingSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdminBook}
              disabled={
                bookingSubmitting ||
                bookingStudents.length === 0 ||
                !bookStudentId ||
                (lessonType === "pacote_credito" &&
                  (!studentPackageId || studentPackagesOpt.length === 0)) ||
                (lessonType === "pacote_novo" &&
                  (!newPackageId || shopPackagesOpt.length === 0))
              }
            >
              {bookingSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slot Confirmation */}
      <Dialog
        open={deleteSlotDialog.open}
        onOpenChange={(open) => !deletingSlot && setDeleteSlotDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir horário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o horário {deleteSlotDialog.slot?.time}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSlotDialog({ open: false, slot: null })} disabled={deletingSlot}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot} disabled={deletingSlot}>
              {deletingSlot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {session.bookingSource === "admin" && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                Pela escola
              </Badge>
            )}
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
