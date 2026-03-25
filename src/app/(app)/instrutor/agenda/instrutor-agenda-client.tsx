"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKey } from "@/lib/styles/status-colors";
import { formatTime, whatsappLink } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
} from "@/lib/icons";
import { buildWeekDays } from "@/lib/date-utils";

interface SessionRow {
  uuid: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: string;
  type: string | null;
  studentName: string;
  studentPhone: string;
  spotName: string;
}

export function InstrutorAgendaClient({
  sessions,
  currentDate,
}: {
  sessions: SessionRow[];
  currentDate: string;
}) {
  const router = useRouter();
  const weekDays = buildWeekDays(currentDate);

  function navigateToDate(date: string) {
    router.push(`/instrutor/agenda?date=${date}`);
  }

  function shiftWeek(direction: number) {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + direction * 7);
    navigateToDate(d.toISOString().split("T")[0]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg -mx-4 -mt-4 mb-2">
        <h1 className="mb-1 text-2xl font-bold">Minha Agenda</h1>
        <p className="text-sm opacity-90">
          {sessions.length} aula{sessions.length !== 1 && "s"} neste dia
        </p>
      </div>

      {/* Day navigation */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => shiftWeek(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => navigateToDate(day.date)}
              className={`flex min-w-[52px] flex-1 flex-col items-center rounded-lg px-2 py-2 text-xs transition-colors ${
                day.date === currentDate
                  ? "bg-primary text-primary-foreground font-semibold"
                  : day.isToday
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="capitalize">{day.dayLabel}</span>
              <span className="text-[11px]">{day.label}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => shiftWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma aula neste dia</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.uuid} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(s.startTime)}
                      {s.endTime && ` – ${formatTime(s.endTime)}`}
                    </span>
                    <StatusBadge status={s.status as StatusKey} />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{s.studentName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {s.spotName}
                  </div>
                </div>
                {s.studentPhone && (
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href={whatsappLink(s.studentPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
