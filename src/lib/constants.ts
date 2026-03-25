// ============================================================
// Roles
// ============================================================
export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ============================================================
// Experience levels
// ============================================================
export const EXPERIENCE_LEVELS = {
  BEGINNER: "iniciante",
  INTERMEDIATE: "intermediario",
  ADVANCED: "avancado",
} as const;

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export type ExperienceLevel =
  (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS];

// ============================================================
// Session statuses
// ============================================================
export const SESSION_STATUSES = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  CANCELLED_WEATHER: "cancelled_weather",
  CANCELLED_STUDENT: "cancelled_student",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES];

// ============================================================
// Package statuses
// ============================================================
export const PACKAGE_STATUSES = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type PackageStatus =
  (typeof PACKAGE_STATUSES)[keyof typeof PACKAGE_STATUSES];

// ============================================================
// Payment
// ============================================================
export const PAYMENT_METHODS = {
  PIX: "pix",
  CARD: "card",
  CASH: "cash",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  OVERDUE: "overdue",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

// ============================================================
// Defaults
// ============================================================
export const DEFAULTS = {
  SESSION_DURATION_MINUTES: 120,
  CURRENCY: "BRL",
  LOCALE: "pt-BR",
  TIMEZONE: "America/Fortaleza",
} as const;

// ============================================================
// Navigation
// ============================================================
export const STUDENT_NAV_ITEMS = [
  { href: "/aluno/aulas", label: "Aulas", icon: "Calendar" },
  { href: "/aluno/pacotes", label: "Pacotes", icon: "Zap" },
  { href: "/aluno/convidar", label: "Convidar", icon: "UserPlus" },
  { href: "/aluno/conta", label: "Conta", icon: "User" },
] as const;

export const INSTRUCTOR_NAV_ITEMS = [
  { href: "/instrutor/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/instrutor/conta", label: "Conta", icon: "User" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "Home" },
  { href: "/admin/agenda", label: "Agenda", icon: "Calendar" },
  { href: "/admin/agenda/nova", label: "Nova Agenda", icon: "Plus" },
  { href: "/admin/alunos", label: "Alunos", icon: "Users" },
  { href: "/admin/instrutores", label: "Instrutores", icon: "Award" },
  { href: "/admin/spots", label: "Spots", icon: "MapPin" },
  { href: "/admin/convites", label: "Convites", icon: "Mail" },
  { href: "/admin/pacotes", label: "Pacotes", icon: "Package" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "DollarSign" },
  { href: "/admin/escola", label: "Escola", icon: "Settings" },
] as const;

export const SUPERADMIN_NAV_ITEMS = [
  { href: "/super-admin", label: "Dashboard", icon: "Home" },
  { href: "/super-admin/spots", label: "Global Spots", icon: "MapPin" },
  { href: "/super-admin/escolas", label: "Escolas", icon: "Store" },
  { href: "/super-admin/alunos", label: "Alunos", icon: "Users" },
] as const;

// ============================================================
// Booking rules (default)
// ============================================================
export const DEFAULT_BOOKING_RULES = [
  "Chegar 15 minutos antes da aula",
  "Desmarcar com um dia antes",
  "Aula desmarcada no dia será considerada aula realizada",
] as const;
