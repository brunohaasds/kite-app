import { cn } from "@/lib/utils";

export function MobileContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[480px]", className)}>
      {children}
    </div>
  );
}
