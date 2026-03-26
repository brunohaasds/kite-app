import Image from "next/image";
import { EKITE_LOGO_URL } from "@/lib/branding";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

/** Dimensões intrínsecas (logo horizontal). */
const dim = { sm: { w: 120, h: 32 }, md: { w: 150, h: 40 }, lg: { w: 180, h: 48 } };

export function AppLogo({ size = "lg", className, priority }: Props) {
  const { w, h } = dim[size];
  return (
    <Image
      src={EKITE_LOGO_URL}
      alt="eKite"
      width={w}
      height={h}
      className={cn("h-auto w-auto max-w-full object-contain", className)}
      priority={priority}
    />
  );
}
