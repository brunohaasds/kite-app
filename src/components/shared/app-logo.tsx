import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const px = { sm: 32, md: 44, lg: 64 };

export function AppLogo({ size = "lg", className }: Props) {
  const n = px[size];
  return (
    <Image
      src="/logo.png"
      alt="eKite"
      width={n}
      height={n}
      className={cn("object-contain", className)}
      priority
    />
  );
}
