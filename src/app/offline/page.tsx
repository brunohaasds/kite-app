import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sem ligação",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Sem ligação à internet</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Verifique a rede e tente novamente. As páginas que já visitou podem aparecer em
        cache quando estiver offline.
      </p>
      <Button asChild>
        <Link href="/">Ir ao início</Link>
      </Button>
    </div>
  );
}
