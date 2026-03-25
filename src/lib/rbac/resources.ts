export const RESOURCES = {
  organizations: "organizations",
  spots: "spots",
  users: "users",
  students: "students",
  instructors: "instructors",
  packages: "packages",
  sessions: "sessions",
  agendas: "agendas",
  payments: "payments",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

export const ACTIONS = {
  list: "list",
  read: "read",
  create: "create",
  update: "update",
  delete: "delete",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
