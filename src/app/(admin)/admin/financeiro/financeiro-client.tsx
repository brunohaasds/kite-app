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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKey } from "@/lib/styles/status-colors";
import { formatCurrency, whatsappLink } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  MessageCircle,
  Copy,
  Loader2,
  AlertTriangle,
} from "@/lib/icons";
import { toast } from "sonner";

interface PaymentRow {
  uuid: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  method: string | null;
  status: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  dueDate: string | null;
  paidAt: string | null;
}

interface Summary {
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
}

export function FinanceiroClient({
  payments: initialPayments,
  summary,
}: {
  payments: PaymentRow[];
  summary: Summary;
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [payDialog, setPayDialog] = useState<{
    open: boolean;
    payment: PaymentRow | null;
  }>({ open: false, payment: null });
  const [whatsappDialog, setWhatsappDialog] = useState<{
    open: boolean;
    payment: PaymentRow | null;
  }>({ open: false, payment: null });
  const [payMethod, setPayMethod] = useState("pix");
  const [loading, setLoading] = useState(false);

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

  function getWhatsappMessage(p: PaymentRow) {
    return `Olá ${p.studentName}! 🪁\n\nLembrete de pagamento:\nValor: ${formatCurrency(p.amount)}\n${p.dueDate ? `Vencimento: ${new Date(p.dueDate).toLocaleDateString("pt-BR")}` : ""}\n${p.installmentNumber ? `Parcela ${p.installmentNumber}/${p.totalInstallments}` : ""}\n\nQualquer dúvida, estamos à disposição!`;
  }

  function openWhatsapp(p: PaymentRow) {
    window.open(whatsappLink(p.studentPhone, getWhatsappMessage(p)), "_blank");
  }

  async function copyPaymentLink(p: PaymentRow) {
    const link = `${window.location.origin}/pagamento/${p.uuid}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  }

  function filterPayments(tab: string) {
    if (tab === "all") return payments;
    return payments.filter((p) => p.status === tab);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground text-sm">
          Gestão de pagamentos e cobranças
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(summary.totalReceived)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atrasado</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(summary.totalOverdue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List with Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all">
            Todos ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Pagos
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Atrasados
          </TabsTrigger>
        </TabsList>

        {["all", "paid", "pending", "overdue"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
            {filterPayments(tab).length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
                <DollarSign className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhum pagamento encontrado
                </p>
              </div>
            ) : (
              filterPayments(tab).map((p) => (
                <div
                  key={p.uuid}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{p.studentName}</span>
                        <StatusBadge status={p.status as StatusKey} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="font-semibold">
                          {formatCurrency(p.amount)}
                        </span>
                        {p.method && (
                          <span className="text-muted-foreground uppercase text-xs">
                            {p.method}
                          </span>
                        )}
                        {p.installmentNumber && (
                          <span className="text-muted-foreground text-xs">
                            {p.installmentNumber}/{p.totalInstallments}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.dueDate && (
                          <span>
                            Vence:{" "}
                            {new Date(p.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {p.paidAt && (
                          <span className="ml-3">
                            Pago:{" "}
                            {new Date(p.paidAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>

                    {(p.status === "pending" || p.status === "overdue") && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPayDialog({ open: true, payment: p })
                          }
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Pagar
                        </Button>
                        {p.studentPhone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setWhatsappDialog({ open: true, payment: p })
                            }
                          >
                            <MessageCircle className="mr-1 h-3.5 w-3.5" />
                            Cobrar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPaymentLink(p)}
                        >
                          <Copy className="mr-1 h-3.5 w-3.5" />
                          Link
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Mark Paid Dialog */}
      <Dialog
        open={payDialog.open}
        onOpenChange={(open) =>
          !loading && setPayDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como pago</DialogTitle>
            <DialogDescription>
              {payDialog.payment &&
                `${payDialog.payment.studentName} — ${formatCurrency(payDialog.payment.amount)}`}
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

      {/* WhatsApp Cobrar Dialog */}
      <Dialog
        open={whatsappDialog.open}
        onOpenChange={(open) =>
          setWhatsappDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cobrar via WhatsApp</DialogTitle>
            <DialogDescription>
              Mensagem que será enviada para {whatsappDialog.payment?.studentName}
            </DialogDescription>
          </DialogHeader>
          {whatsappDialog.payment && (
            <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line">
              {getWhatsappMessage(whatsappDialog.payment)}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setWhatsappDialog({ open: false, payment: null })
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (whatsappDialog.payment) openWhatsapp(whatsappDialog.payment);
                setWhatsappDialog({ open: false, payment: null });
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
