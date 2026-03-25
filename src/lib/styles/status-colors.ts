export const STATUS_COLORS = {
  // Session statuses
  scheduled: {
    label: "Agendada",
    bgClass: "bg-amber-100 text-amber-800",
    dotClass: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmada",
    bgClass: "bg-green-100 text-green-800",
    dotClass: "bg-green-500",
  },
  completed: {
    label: "Concluída",
    bgClass: "bg-[oklch(0.65_0.17_150)] text-white",
    dotClass: "bg-[oklch(0.65_0.17_150)]",
  },
  cancelled: {
    label: "Cancelada",
    bgClass: "bg-red-100 text-red-800",
    dotClass: "bg-red-500",
  },
  cancelled_weather: {
    label: "Cancelada (clima)",
    bgClass: "bg-blue-100 text-blue-800",
    dotClass: "bg-blue-500",
  },
  cancelled_student: {
    label: "Cancelada (aluno)",
    bgClass: "bg-red-100 text-red-800",
    dotClass: "bg-red-500",
  },

  // Package statuses
  active: {
    label: "Ativo",
    bgClass: "bg-[oklch(0.65_0.17_150)]/10 text-[oklch(0.65_0.17_150)]",
    dotClass: "bg-[oklch(0.65_0.17_150)]",
  },
  inactive: {
    label: "Inativo",
    bgClass: "bg-slate-200 text-slate-700",
    dotClass: "bg-slate-400",
  },

  // Payment statuses
  pending: {
    label: "Pendente",
    bgClass: "bg-amber-100 text-amber-800",
    dotClass: "bg-amber-500",
  },
  paid: {
    label: "Pago",
    bgClass: "bg-[oklch(0.65_0.17_150)] text-white",
    dotClass: "bg-[oklch(0.65_0.17_150)]",
  },
  overdue: {
    label: "Atrasado",
    bgClass: "bg-red-100 text-red-800",
    dotClass: "bg-red-500",
  },
  refunded: {
    label: "Reembolsado",
    bgClass: "bg-slate-200 text-slate-700",
    dotClass: "bg-slate-400",
  },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;
