import { cn } from "@/lib/utils";

export function MobileContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[480px] md:max-w-7xl md:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
