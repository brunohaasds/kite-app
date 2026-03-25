"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "@/lib/icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1>
      <p className="mb-6 text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
