"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Início" },
  { href: "/spots", label: "Spots" },
  { href: "/centers", label: "Centros" },
] as const;

function NavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 md:flex-row md:items-center md:gap-6", className)}>
      {NAV.map((item) => {
        const active =
          item.href === "/spots"
            ? pathname === "/spots" || pathname.startsWith("/spot/")
            : pathname === "/centers" || pathname.startsWith("/escola/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-2 py-2 text-sm font-medium transition-colors md:py-0",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PublicSiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-[480px] items-center justify-between gap-3 px-4 md:h-16 md:max-w-7xl md:px-6 lg:px-8">
        <Link href="/home" className="text-lg font-bold tracking-tight text-primary">
          eKite
        </Link>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
                <Button asChild className="w-full">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
