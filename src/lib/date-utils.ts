export interface WeekDay {
  date: string;
  label: string;
  dayLabel: string;
  isToday: boolean;
}

export function buildWeekDays(centerDate: string): WeekDay[] {
  const center = new Date(centerDate + "T12:00:00");
  const days: WeekDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    days.push({
      date: iso,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      dayLabel: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      isToday: d.getTime() === today.getTime(),
    });
  }
  return days;
}
