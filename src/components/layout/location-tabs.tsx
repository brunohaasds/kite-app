"use client";

import { cn } from "@/lib/utils";
import { MapPin } from "@/lib/icons";

interface LocationTabsProps {
  spots: { id: number; name: string }[];
  activeSpotId: number | null;
  onSelect: (spotId: number | null) => void;
}

export function LocationTabs({
  spots,
  activeSpotId,
  onSelect,
}: LocationTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          activeSpotId === null
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/50",
        )}
      >
        <MapPin className="h-3 w-3" />
        Todos
      </button>
      {spots.map((spot) => (
        <button
          key={spot.id}
          onClick={() => onSelect(spot.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            activeSpotId === spot.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50",
          )}
        >
          <MapPin className="h-3 w-3" />
          {spot.name}
        </button>
      ))}
    </div>
  );
}
