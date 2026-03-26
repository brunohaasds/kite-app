"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SlotData {
  time: string;
  instructor: string;
  booked: boolean;
  spotName: string | null;
  slotId: number;
}

interface DayGroup {
  date: string;
  dateLabel: string;
  dayShort: string;
  dayNum: string;
  slots: SlotData[];
}

interface Props {
  orgSlug: string;
  dayGroups: DayGroup[];
}

export function AgendaPublicClient({ orgSlug, dayGroups }: Props) {
  const [selectedDate, setSelectedDate] = useState(
    dayGroups[0]?.date ?? "",
  );

  const currentGroup = dayGroups.find((g) => g.date === selectedDate);

  if (dayGroups.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground p-4">
        Nenhum horário disponível no momento
      </div>
    );
  }

  return (
    <div>
      {/* Day pills */}
      <div className="flex gap-1.5 overflow-x-auto p-4 pb-2 scrollbar-hide">
        {dayGroups.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`flex min-w-[56px] flex-col items-center rounded-xl px-3 py-2 text-xs transition-colors shrink-0 ${
              day.date === selectedDate
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className="capitalize">{day.dayShort}</span>
            <span className="text-[11px] mt-0.5">{day.dayNum}</span>
          </button>
        ))}
      </div>

      {/* Slots for selected day */}
      <div className="space-y-3 p-4 pt-2">
        {!currentGroup || currentGroup.slots.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum horário neste dia
          </div>
        ) : (
          currentGroup.slots.map((slot, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">{slot.time}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {slot.instructor}
                    {slot.spotName && ` · ${slot.spotName}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    slot.booked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {slot.booked ? "Ocupado" : "Disponível"}
                </span>
              </div>

              {!slot.booked && (
                <Link href={`/escola/${orgSlug}/agendar/${slot.slotId}`}>
                  <Button className="w-full">Agendar</Button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
