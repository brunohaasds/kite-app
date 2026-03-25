import { STATUS_COLORS, type StatusKey } from "@/lib/styles/status-colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_COLORS[status];

  if (!config) {
    return (
      <span className={cn("rounded-full px-2 py-1 text-xs font-medium bg-slate-200 text-slate-700", className)}>
        {status}
      </span>
    );
  }

  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", config.bgClass, className)}>
      {config.label}
    </span>
  );
}
