# Padrão RBAC — Controle de Acesso

**Last Updated:** [DATA]

---

## Modelo Single-Layer (simplificado)

```
ROLE_RULES → imutável, definido no código
```

Permissões definidas apenas por role — sem profiles configuráveis.
Mais simples, adequado para apps com roles fixos e bem definidos.

---

## ROLE_RULES

```typescript
// src/lib/rbac/permission-rules.ts

export const ROLE_RULES: Record<string, { always: string[]; never: string[] }> = {
  super_admin: {
    always: ["*"],   // acesso total
    never: [],
  },
  admin: {
    always: [
      "users:view", "users:create", "users:edit",
    ],
    never: [
      "users:delete",  // admin não pode deletar usuários (só super_admin)
    ],
  },
  user: {
    always: [
      // Definir aqui o que todo user pode fazer por padrão
    ],
    never: [
      "users:*",  // user nunca gerencia usuários
    ],
  },
};
```

---

## Funções de Verificação

```typescript
// src/lib/rbac/require-permission.ts

// Em page.tsx (redireciona se sem acesso)
export async function requirePermission(resource: string, action: string) {
  const session = await auth();
  if (!session) redirect("/login");
  const allowed = await checkPermission(session.user, resource, action);
  if (!allowed) redirect("/no-access");
  return session;
}

// Em actions.ts (lança erro se sem acesso)
export async function requireActionPermission(resource: string, action: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");
  const allowed = await checkPermission(session.user, resource, action);
  if (!allowed) throw new Error("Sem permissão");
  return session;
}
```

---

## Roles e Home Routing

| Role | Home redirect |
|------|--------------|
| `super_admin` | `/admin/clients` |
| `admin` | `/admin/users` |
| `user` | `/dashboard` |

---

## Recursos (RESOURCES)

```typescript
// src/lib/rbac/resources.ts
// Registrar cada recurso do sistema aqui

export const RESOURCES = [
  { resource: "users",    module: "admin",    label: "Usuários" },
  { resource: "profiles", module: "admin",    label: "Perfis" },
  // ... adicionar ao criar novo módulo
] as const;
```

---

## Regras de Negócio de Usuários

- **Ninguém pode deletar a si mesmo**
- **Admin não vê/edita super_admin**
- **user precisa ter um profile**
- **admin/super_admin podem ter profile nulo**

---

## Verificação de Permissão — Algoritmo

```
1. Checar ROLE_RULES[role].never → se match: NEGAR
2. Checar ROLE_RULES[role].always → se match: PERMITIR
3. Se role === "user": checar profile_permissions no DB
4. Default: NEGAR
```
