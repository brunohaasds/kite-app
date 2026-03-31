"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Map, MapPin, Menu } from "@/lib/icons";
import { KitesurfIcon } from "@/components/icons/kitesurf-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppLogo } from "@/components/shared/app-logo";
import { cn } from "@/lib/utils";
import { getAppHomePath } from "@/lib/auth-routes";
import type { PublicNavSessionUser } from "@/components/layout/public-journey-shell";

const NAV = [
  { href: "/home", label: "Início", Icon: Home },
  { href: "/spots", label: "Spots", Icon: MapPin },
  { href: "/mapa", label: "Mapa", Icon: Map },
  { href: "/centers", label: "Centros", Icon: KitesurfIcon },
] as const;

function isNavActive(href: string, pathname: string) {
  if (href === "/home") return pathname === "/home";
  if (href === "/spots") return pathname === "/spots" || pathname.startsWith("/spot/");
  if (href === "/mapa") return pathname === "/mapa";
  if (href === "/centers") return pathname === "/centers" || pathname.startsWith("/escola/");
  return false;
}

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
        const active = isNavActive(item.href, pathname);
        const Icon = item.Icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors md:py-0",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PublicSiteHeader({
  sessionUser = null,
}: {
  sessionUser?: PublicNavSessionUser;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const appHref = sessionUser ? getAppHomePath(sessionUser.role) : "/login";

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-[480px] items-center justify-between gap-3 px-4 md:h-16 md:max-w-7xl md:px-6 lg:px-8">
        <Link href="/home" className="flex shrink-0 items-center" aria-label="eKite — Início">
          <AppLogo size="sm" priority className="max-h-8 md:max-h-9" />
        </Link>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          {sessionUser ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden gap-2 md:inline-flex"
            >
              <Link
                href={appHref}
                className="flex items-center gap-2"
                aria-label="Abrir aplicação eKite"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                App
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
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
                {sessionUser ? (
                  <Button asChild className="w-full gap-2">
                    <Link
                      href={appHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2"
                      aria-label="Abrir aplicação eKite"
                    >
                      <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                      App
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
