import type { Resource, Action } from "./resources";

type PermissionMap = Record<string, Partial<Record<Resource, Action[]>>>;

export const ROLE_RULES: PermissionMap = {
  superadmin: {
    organizations: ["list", "read", "create", "update", "delete"],
    spots: ["list", "read", "create", "update", "delete"],
    users: ["list", "read", "create", "update", "delete"],
    students: ["list", "read", "create", "update", "delete"],
    instructors: ["list", "read", "create", "update", "delete"],
    packages: ["list", "read", "create", "update", "delete"],
    sessions: ["list", "read", "create", "update", "delete"],
    agendas: ["list", "read", "create", "update", "delete"],
    payments: ["list", "read", "create", "update", "delete"],
  },
  admin: {
    organizations: ["list", "read", "update"],
    spots: ["list", "read", "create", "update", "delete"],
    users: ["list", "read", "create", "update", "delete"],
    students: ["list", "read", "create", "update", "delete"],
    instructors: ["list", "read", "create", "update", "delete"],
    packages: ["list", "read", "create", "update", "delete"],
    sessions: ["list", "read", "create", "update", "delete"],
    agendas: ["list", "read", "create", "update", "delete"],
    payments: ["list", "read", "create", "update", "delete"],
  },
  instructor: {
    sessions: ["list", "read", "update"],
    students: ["list", "read"],
    agendas: ["list", "read"],
  },
  student: {
    sessions: ["list", "read"],
    packages: ["list", "read"],
    payments: ["list", "read"],
  },
};

export function hasPermission(
  role: string,
  resource: Resource,
  action: Action,
): boolean {
  const rules = ROLE_RULES[role];
  if (!rules) return false;
  const allowed = rules[resource];
  if (!allowed) return false;
  return allowed.includes(action);
}
