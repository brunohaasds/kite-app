"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, LogIn, Map, MapPin } from "@/lib/icons";
import { KitesurfIcon } from "@/components/icons/kitesurf-icon";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import { getAppHomePath } from "@/lib/auth-routes";
import type { PublicNavSessionUser } from "@/components/layout/public-journey-shell";

const iconMap: Record<string, React.ElementType> = {
  Home,
  MapPin,
  Map,
  Kitesurf: KitesurfIcon,
  LogIn,
};

const PRIMARY_NAV = PUBLIC_NAV_ITEMS.slice(0, 4);

function isAppShellPath(pathname: string) {
  return (
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instrutor") ||
    pathname.startsWith("/aluno") ||
    pathname.startsWith("/prestador")
  );
}

function isBookingWizardPath(pathname: string) {
  return /\/escola\/[^/]+\/agendar\//.test(pathname);
}

function PublicBottomNavBar({ sessionUser }: { sessionUser: PublicNavSessionUser }) {
  const pathname = usePathname();
  const appHref = sessionUser ? getAppHomePath(sessionUser.role) : "/login";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="mx-auto flex max-w-[480px] items-center justify-around">
        {PRIMARY_NAV.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/home"
              ? pathname === "/home"
              : item.href === "/spots"
                ? pathname === "/spots" || pathname.startsWith("/spot/")
                : item.href === "/mapa"
                  ? pathname === "/mapa"
                  : item.href === "/centers"
                    ? pathname === "/centers" || pathname.startsWith("/escola/")
                    : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
        {sessionUser ? (
          <Link
            href={appHref}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
              isAppShellPath(pathname)
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Abrir aplicação eKite"
          >
            <LayoutGrid className="h-5 w-5" aria-hidden />
            <span>App</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
              pathname.startsWith("/login") ||
                pathname.startsWith("/cadastro") ||
                pathname.startsWith("/convite")
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LogIn className="h-5 w-5" />
            <span>Entrar</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

/**
 * Espaço inferior + barra fixa no mobile; oculta no fluxo de agendamento público.
 */
export function PublicMobileNav({
  children,
  sessionUser = null,
}: {
  children: React.ReactNode;
  sessionUser?: PublicNavSessionUser;
}) {
  const pathname = usePathname();
  const showBottomNav = !isBookingWizardPath(pathname);

  return (
    <>
      <div className={cn(showBottomNav && "pb-16 md:pb-0")}>{children}</div>
      {showBottomNav ? <PublicBottomNavBar sessionUser={sessionUser} /> : null}
    </>
  );
}
