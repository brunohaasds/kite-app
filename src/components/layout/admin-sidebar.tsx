"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Calendar,
  Plus,
  Users,
  Package,
  DollarSign,
  Mail,
  MapPin,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
  Wind,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Calendar,
  Plus,
  Users,
  Package,
  DollarSign,
  Mail,
  MapPin,
  Award,
  Settings,
};

type NavItem = { href: string; label: string; icon: string };

function NavContent({
  onLinkClick,
  extraItems,
}: {
  onLinkClick?: () => void;
  extraItems: NavItem[];
}) {
  const pathname = usePathname();

  const items = [...ADMIN_NAV_ITEMS, ...extraItems];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wind className="h-4 w-4" />
        </div>
        <span className="font-bold">Kite App</span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? MapPin;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/admin/agenda"
                ? pathname === "/admin/agenda"
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [extraItems, setExtraItems] = useState<NavItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/spots/has-owned")
      .then((r) => r.json())
      .then((data) => {
        if (data.hasOwnedSpot) {
          setExtraItems([
            { href: "/admin/meu-spot", label: "Meu Spot", icon: "MapPin" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-3 top-3 z-50 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        <NavContent
          onLinkClick={() => setOpen(false)}
          extraItems={extraItems}
        />
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 lg:border-r lg:bg-card">
        <NavContent extraItems={extraItems} />
      </aside>
    </>
  );
}
