export interface WeekDay {
  date: string;
  label: string;
  dayLabel: string;
  isToday: boolean;
}

/** YYYY-MM-DD como data civil no fuso local (meio-dia evita bordas). */
export function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Formata ISO vindo do Prisma (ex.: …T00:00:00.000Z) sem “pular” o dia no Brasil:
 * usa só YYYY-MM-DD como data civil local.
 */
export function formatDateFromIso(
  iso: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const ymd = iso.slice(0, 10);
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", options);
}

export function buildWeekDays(centerDate: string): WeekDay[] {
  const center = new Date(centerDate + "T12:00:00");
  const days: WeekDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayMidnight = new Date(d);
    dayMidnight.setHours(0, 0, 0, 0);
    days.push({
      date: iso,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      dayLabel: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      isToday: dayMidnight.getTime() === today.getTime(),
    });
  }
  return days;
}
