"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Zap, User } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Calendar,
  Zap,
  User,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="mx-auto flex max-w-[480px] items-center justify-around">
        {STUDENT_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
