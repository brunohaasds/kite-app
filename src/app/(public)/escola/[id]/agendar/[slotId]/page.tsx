"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MobileContainer } from "@/components/layout/mobile-container";
import { ArrowLeft } from "@/lib/icons";

interface Props {
  params: Promise<{ id: string; slotId: string }>;
}

export default function BookingFormPage({ params }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("avulsa");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { slotId, id } = await params;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: Number(slotId),
          orgId: Number(id),
          name: formData.get("name"),
          phone: formData.get("phone"),
          level: formData.get("level"),
          paymentType,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      router.push("/agendamento/confirmado");
    } catch {
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileContainer>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <Link href="javascript:history.back()">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Agendar aula</h1>
            <p className="text-sm text-muted-foreground">
              Preencha seus dados
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">
            Nome completo
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Seu nome"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base">
            WhatsApp
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(85) 99999-9999"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base">Nível de experiência</Label>
          <RadioGroup defaultValue="iniciante" name="level" className="space-y-3">
            {[
              { value: "iniciante", label: "Iniciante (primeira vez)" },
              { value: "intermediario", label: "Intermediário" },
              { value: "avancado", label: "Avançado" },
            ].map((opt) => (
              <div
                key={opt.value}
                className="flex items-center space-x-3 rounded-lg border bg-card p-4"
              >
                <RadioGroupItem value={opt.value} id={opt.value} />
                <Label htmlFor={opt.value} className="flex-1 cursor-pointer font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Como deseja pagar?</Label>
          <RadioGroup
            value={paymentType}
            onValueChange={setPaymentType}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 rounded-lg border bg-card p-4">
              <RadioGroupItem value="avulsa" id="avulsa" />
              <Label htmlFor="avulsa" className="flex-1 cursor-pointer font-normal">
                Aula avulsa
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border bg-card p-4">
              <RadioGroupItem value="pacote" id="pacote" />
              <Label htmlFor="pacote" className="flex-1 cursor-pointer font-normal">
                Usar crédito do pacote
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4">
          <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={loading}>
            {loading ? "Agendando..." : "Confirmar agendamento"}
          </Button>
        </div>
      </form>
    </MobileContainer>
  );
}
