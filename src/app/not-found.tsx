import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">Página não encontrada</p>
      <Link href="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
