"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKey } from "@/lib/styles/status-colors";
import { formatCurrency, formatDate, formatTime, whatsappLink } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Package,
  DollarSign,
  CheckCircle2,
  MessageCircle,
  Loader2,
} from "@/lib/icons";
import { toast } from "sonner";
import Link from "next/link";
import { AdminSchoolPageHeader } from "@/components/layout/admin-school-page-header";

interface StudentInfo {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  level: string;
}

interface SessionRow {
  uuid: string;
  date: string;
  startTime: string;
  status: string;
  instructorName: string;
  spotName: string;
}

interface PackageRow {
  uuid: string;
  packageTitle: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  status: string;
  purchaseDate: string;
  expiryDate: string | null;
}

interface PaymentRow {
  uuid: string;
  amount: number;
  method: string | null;
  status: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  dueDate: string | null;
  paidAt: string | null;
}

const LEVEL_LABELS: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function AlunoDetailClient({
  student,
  upcomingSessions,
  pastSessions,
  packages,
  payments: initialPayments,
  totalSessions,
}: {
  student: StudentInfo;
  upcomingSessions: SessionRow[];
  pastSessions: SessionRow[];
  packages: PackageRow[];
  payments: PaymentRow[];
  totalSessions: number;
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [payDialog, setPayDialog] = useState<{
    open: boolean;
    payment: PaymentRow | null;
  }>({ open: false, payment: null });
  const [payMethod, setPayMethod] = useState("pix");
  const [loading, setLoading] = useState(false);

  const activePackages = packages.filter((p) => p.status === "active");
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "overdue");

  async function handleMarkPaid() {
    if (!payDialog.payment) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payDialog.payment.uuid,
          method: payMethod,
        }),
      });
      if (!res.ok) throw new Error("Falha ao marcar como pago");

      setPayments((prev) =>
        prev.map((p) =>
          p.uuid === payDialog.payment!.uuid
            ? { ...p, status: "paid", method: payMethod, paidAt: new Date().toISOString() }
            : p,
        ),
      );
      toast.success("Pagamento marcado como pago!");
      setPayDialog({ open: false, payment: null });
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setLoading(false);
    }
  }

  function openWhatsappPayment(payment: PaymentRow) {
    const msg = `Olá ${student.name}! 🪁\n\nLembrete de pagamento:\nValor: ${formatCurrency(payment.amount)}\n${payment.dueDate ? `Vencimento: ${new Date(payment.dueDate).toLocaleDateString("pt-BR")}` : ""}\n\nQualquer dúvida, estamos à disposição!`;
    window.open(whatsappLink(student.phone, msg), "_blank");
  }

  return (
    <div className="space-y-6">
      <AdminSchoolPageHeader
        title="Detalhes do Aluno"
        subtitle={student.name}
        subtitleMobileOnly
        start={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/alunos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      {/* Student Header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <Badge variant="secondary">
                {LEVEL_LABELS[student.level] ?? student.level}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {student.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <Calendar className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{totalSessions}</p>
          <p className="text-xs text-muted-foreground">Total aulas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <Package className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{activePackages.length}</p>
          <p className="text-xs text-muted-foreground">Pacotes ativos</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <DollarSign className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{pendingPayments.length}</p>
          <p className="text-xs text-muted-foreground">Pagtos pendentes</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Aulas
        </h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border bg-card p-4 shadow-sm text-center">
            Nenhuma aula agendada
          </p>
        ) : (
          upcomingSessions.map((s) => (
            <div key={s.uuid} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatDate(s.date)} · {formatTime(s.startTime)}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {s.instructorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {s.spotName}
                    </span>
                  </div>
                </div>
                <StatusBadge status={s.status as StatusKey} />
              </div>
            </div>
          ))
        )}
      </section>

      {/* Active Packages */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pacotes Ativos
        </h2>
        {activePackages.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border bg-card p-4 shadow-sm text-center">
            Nenhum pacote ativo
          </p>
        ) : (
          activePackages.map((pkg) => {
            const progress =
              pkg.sessionsTotal > 0
                ? Math.round((pkg.sessionsUsed / pkg.sessionsTotal) * 100)
                : 0;
            return (
              <div key={pkg.uuid} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pkg.packageTitle}</span>
                  <StatusBadge status={pkg.status as StatusKey} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {pkg.sessionsUsed}/{pkg.sessionsTotal} aulas usadas
                    </span>
                    <span>{pkg.sessionsRemaining} restantes</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Payments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Parcelas
        </h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border bg-card p-4 shadow-sm text-center">
            Nenhum pagamento registrado
          </p>
        ) : (
          payments.map((p) => (
            <div key={p.uuid} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-medium">
                    {formatCurrency(p.amount)}
                  </span>
                  {p.installmentNumber && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {p.installmentNumber}/{p.totalInstallments}
                    </span>
                  )}
                </div>
                <StatusBadge status={p.status as StatusKey} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {p.dueDate
                    ? `Vence: ${new Date(p.dueDate).toLocaleDateString("pt-BR")}`
                    : "Sem vencimento"}
                </span>
                {p.paidAt && (
                  <span>
                    Pago: {new Date(p.paidAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              {(p.status === "pending" || p.status === "overdue") && (
                <div className="mt-3 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Marcar parcela como paga"
                    onClick={() => setPayDialog({ open: true, payment: p })}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="sr-only">Marcar parcela como paga</span>
                  </Button>
                  {student.phone && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      title="Cobrar via WhatsApp"
                      onClick={() => openWhatsappPayment(p)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">Cobrar via WhatsApp</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* Past sessions collapsed */}
      {pastSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Histórico ({pastSessions.length} aulas)
          </h2>
          {pastSessions.slice(0, 5).map((s) => (
            <div key={s.uuid} className="rounded-xl border bg-card p-3 shadow-sm opacity-70">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {new Date(s.date).toLocaleDateString("pt-BR")} · {formatTime(s.startTime)}
                </span>
                <StatusBadge status={s.status as StatusKey} />
              </div>
            </div>
          ))}
          {pastSessions.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              +{pastSessions.length - 5} aulas anteriores
            </p>
          )}
        </section>
      )}

      {/* Mark Paid Dialog */}
      <Dialog
        open={payDialog.open}
        onOpenChange={(open) =>
          !loading && setPayDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como paga</DialogTitle>
            <DialogDescription>
              {payDialog.payment &&
                `Confirma o pagamento de ${formatCurrency(payDialog.payment.amount)}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de pagamento</label>
            <Select value={payMethod} onValueChange={setPayMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="card">Cartão</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayDialog({ open: false, payment: null })}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleMarkPaid} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
