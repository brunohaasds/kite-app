import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileContainer } from "@/components/layout/mobile-container";
import { CheckCircle2 } from "@/lib/icons";

export default function BookingConfirmationPage() {
  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Aula reservada!</h1>
          <p className="text-muted-foreground">
            Acesse sua conta para ver os detalhes da aula
          </p>
        </div>

        <div className="w-full space-y-3">
          <Link href="/aluno/aulas">
            <Button size="lg" className="h-14 w-full">
              Ver minhas aulas
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="h-14 w-full">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    </MobileContainer>
  );
}
