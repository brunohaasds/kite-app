import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Calendar, MapPin, Clock, Backpack, CheckCircle2 } from "@/lib/icons";

export default function BookingConfirmationPage() {
  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* Success icon */}
        <div className="mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Aula reservada!</h1>
          <p className="text-muted-foreground">
            Confirmação depende das condições do vento
          </p>
        </div>

        {/* Info cards */}
        <div className="mb-8 w-full space-y-3">
          <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <Calendar className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Data e hora</p>
              <p className="text-sm text-muted-foreground">
                Confira no WhatsApp da escola
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Local</p>
              <p className="text-sm text-muted-foreground">
                A escola confirmará o spot
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <Clock className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Duração</p>
              <p className="text-sm text-muted-foreground">2 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <Backpack className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">O que levar</p>
              <p className="text-sm text-muted-foreground">
                Protetor solar, água e roupa de banho
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Link href="/escola/1">
            <Button size="lg" className="h-14 w-full">
              Voltar à escola
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 w-full">
              Entrar na plataforma
            </Button>
          </Link>
        </div>
      </div>
    </MobileContainer>
  );
}
