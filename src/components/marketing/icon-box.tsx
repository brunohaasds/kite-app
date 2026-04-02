import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconBoxProps = {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function IconBox({
  icon,
  variant = "primary",
  size = "md",
  className,
}: IconBoxProps) {
  const sizeStyles = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
  };

  /* Ícones sempre text-primary; fundos com tons primary (alinhado a ModernCard). */
  const bgVariants = {
    primary:
      "bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
    secondary:
      "bg-gradient-to-br from-primary/16 to-primary/4 text-primary",
    accent:
      "bg-gradient-to-br from-primary/12 to-primary/3 text-primary",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-300 hover:scale-110",
        sizeStyles[size],
        bgVariants[variant],
        className,
      )}
    >
      <div className={iconSizes[size]}>{icon}</div>
    </div>
  );
}
