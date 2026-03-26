"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Store, LogIn } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Home,
  MapPin,
  Store,
  LogIn,
};

function isBookingWizardPath(pathname: string) {
  return /\/escola\/[^/]+\/agendar\//.test(pathname);
}

function PublicBottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="mx-auto flex max-w-[480px] items-center justify-around">
        {PUBLIC_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/home"
              ? pathname === "/home"
              : item.href === "/spots"
                ? pathname === "/spots" || pathname.startsWith("/spot/")
                : item.href === "/centers"
                  ? pathname === "/centers" || pathname.startsWith("/escola/")
                  : pathname.startsWith("/login") ||
                    pathname.startsWith("/cadastro") ||
                    pathname.startsWith("/convite");

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
      </div>
    </nav>
  );
}

/**
 * Espaço inferior + barra fixa no mobile; oculta no fluxo de agendamento público.
 */
export function PublicMobileNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = !isBookingWizardPath(pathname);

  return (
    <>
      <div
        className={cn(showBottomNav && "pb-16 md:pb-0")}
      >
        {children}
      </div>
      {showBottomNav ? <PublicBottomNavBar /> : null}
    </>
  );
}
