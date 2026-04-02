import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModernCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  items?: string[];
  variant?: "primary" | "secondary" | "accent";
  className?: string;
  style?: React.CSSProperties;
};

export function ModernCard({
  icon,
  title,
  description,
  items,
  variant = "primary",
  className,
  style,
}: ModernCardProps) {
  /* secondary/accent no tema são superfícies claras — contornos e ícones alinhados à família primary. */
  const variantStyles = {
    primary:
      "bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20 hover:border-primary/40",
    secondary:
      "bg-gradient-to-br from-primary/4 via-transparent to-transparent border-primary/15 hover:border-primary/35",
    accent:
      "bg-gradient-to-br from-primary/6 via-transparent to-transparent border-primary/25 hover:border-primary/45",
  };

  const iconBgVariants = {
    primary: "bg-gradient-to-br from-primary/15 to-primary/5",
    secondary: "bg-gradient-to-br from-primary/14 to-primary/5",
    accent: "bg-gradient-to-br from-primary/13 to-primary/4",
  };

  const iconColorVariants = {
    primary: "text-primary",
    secondary: "text-primary",
    accent: "text-primary",
  };

  const bulletVariant = {
    primary: "bg-primary",
    secondary: "bg-primary",
    accent: "bg-primary",
  };

  return (
    <div
      style={style}
      className={cn(
        "group relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        variantStyles[variant],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={cn(
          "relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          iconBgVariants[variant],
        )}
      >
        <div className={cn(iconColorVariants[variant], "h-8 w-8")}>{icon}</div>
      </div>

      <div className="relative z-10">
        <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">{description}</p>

        {items && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground",
                    bulletVariant[variant],
                  )}
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-primary/30" />
    </div>
  );
}
