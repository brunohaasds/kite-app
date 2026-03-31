"use client";

import type { LucideIcon } from "lucide-react";
import { EkiteHeroBackground } from "@/components/marketing/ekite-hero-background";
import { AppLogo } from "@/components/shared/app-logo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthNovaUnderlineField({
  id,
  icon: Icon,
  label,
  className,
  ...inputProps
}: {
  id: string;
  icon: LucideIcon;
  label: string;
} & Omit<React.ComponentProps<typeof Input>, "className"> & {
    className?: string;
  }) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-3 border-b-2 border-primary/25 pb-2 transition-colors focus-within:border-primary">
        <Icon className="h-5 w-5 shrink-0 text-primary/70" aria-hidden />
        <Input
          id={id}
          className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          {...inputProps}
        />
      </div>
    </div>
  );
}

export function AuthNovaShell({
  children,
  heroTagline = "O vento é o que nos move.",
}: {
  children: React.ReactNode;
  heroTagline?: string;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="relative min-h-[min(38vh,320px)] shrink-0 overflow-hidden">
        <EkiteHeroBackground />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/50 to-black/30"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[min(38vh,320px)] flex-col items-center justify-center px-6 py-10 text-center">
          <AppLogo
            size="md"
            priority
            className="mx-auto max-h-10 brightness-0 invert"
          />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
            {heroTagline}
          </p>
        </div>
      </div>

      <div className="relative z-20 -mt-6 flex-1 rounded-t-[2rem] bg-background px-6 pb-10 pt-8 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.12)]">
        {children}
      </div>
    </div>
  );
}
