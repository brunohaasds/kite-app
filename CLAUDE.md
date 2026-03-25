# CLAUDE.md — Instruções para o Agente Claude

> Este arquivo é lido automaticamente pelo Claude Code a cada sessão. Mantenha-o atualizado.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Linguagem | TypeScript (strict) |
| ORM | Prisma + PostgreSQL |
| Auth | NextAuth v5 (Auth.js) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Tabelas | TanStack Table v8 |
| Notificações | Sonner |
| Estado | React useState/useEffect (sem Redux) |
| Deploy | Vercel + Supabase / Neon PostgreSQL |

---

## Arquitetura — Regras Obrigatórias

### Estrutura de pastas

```
src/
├── app/
│   ├── (public)/          # Rotas públicas (login, landing)
│   ├── (app)/             # Rotas autenticadas
│   │   └── <modulo>/
│   │       ├── page.tsx          # Server component — só fetch + render
│   │       ├── actions.ts        # Server actions — auth + validate + domain
│   │       ├── columns.tsx       # Definição de colunas DataTable
│   │       └── <feature>-client.tsx  # Client component
│   └── api/
├── domain/
│   └── <modulo>/
│       └── <feature>/
│           ├── repo.ts     # Queries Prisma (sem lógica de negócio)
│           ├── schema.ts   # Zod schemas
│           ├── types.ts    # TypeScript interfaces
│           └── service.ts  # Lógica de negócio (opcional, só se complexo)
├── components/
│   ├── ui/                # shadcn/ui components (não editar)
│   ├── layout/            # Sidebar, navbar, shell
│   └── <modulo>/          # Componentes específicos do módulo
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Prisma client singleton
│   ├── rbac/              # Sistema de permissões
│   └── utils.ts           # cn() e utilitários
└── types/
    └── index.ts           # Augmentação de tipos NextAuth
```

### Fluxo de dados obrigatório

```
UI (Client) → Server Action (actions.ts) → Domain (repo/service) → Prisma → DB
                    ↓
            1. requireActionPermission()
            2. Validar com Zod
            3. Chamar repo/service
            4. revalidatePath()
            5. return { success } ou throw
```

### Regras de ouro

1. **`actions.ts`** = orquestração apenas. Nunca colocar queries Prisma aqui.
2. **`repo.ts`** = queries Prisma apenas. Nunca colocar lógica de negócio.
3. **`page.tsx`** = Server Component. Nunca `"use client"` em pages.
4. **Zod schemas** sempre em `domain/**/schema.ts`, nunca inline.
5. **Todos os IDs** são `Int` (não BigInt).
6. **`revalidatePath()`** sempre após mutations em actions.

---

## RBAC — Permissões

### Two-layer model

```typescript
// Layer 1: Regras fixas por role (nunca mudam)
const ROLE_RULES = {
  super_admin: { always: ["*"], never: [] },
  admin: { always: ["users:view", "units:view"], never: ["super_admin:edit"] },
  user: { always: [], never: ["admin:*"] },
};

// Layer 2: profile_permissions (configurável por admin, só para users)
// → Cada user tem um profile com permissões granulares
```

### Uso em pages e actions

```typescript
// Em page.tsx (Server Component)
import { requirePermission } from "@/lib/rbac/require-permission";
const session = await requirePermission("resource", "view");

// Em actions.ts (Server Action)
import { requireActionPermission } from "@/lib/rbac/require-permission";
const session = await requireActionPermission("resource", "edit");
```

---

## Multi-tenancy

```typescript
// Isolamento por client_id em todas as queries
// super_admin: acesso global (sem filtro de client)
// admin/user: sempre filtrar por client_id

function scopeWhere(sessionUser: SessionUser) {
  if (sessionUser.role === "super_admin") return {};
  return { client_id: sessionUser.clientId };
}

// Usar em todas as queries do repo.ts
const where = {
  ...scopeWhere(sessionUser),
  deleted_at: null,
};
```

---

## Mobile-First — Regras de UI

### Breakpoints

```typescript
// Tailwind: mobile-first sempre
// ✅ Correto
<div className="flex flex-col md:flex-row">

// ❌ Evitar desktop-first
<div className="hidden-mobile flex">
```

### Componentes principais

| Situação | Componente |
|----------|-----------|
| Listagem de dados | `DataTable` (com search + sort + paginação) |
| Formulário create/edit | `Sheet` (sidebar) em desktop, `Drawer` em mobile |
| Confirmação destrutiva | `AlertDialog` |
| Feedback de ação | `toast()` via Sonner |
| Loading state | `Skeleton` |
| Status visual | `StatusBadge` + `STATUS_COLORS` |

### Padrão de cards mobile

```tsx
// Preferir cards em mobile ao invés de tabelas
// DataTable com fallback para lista de cards em telas pequenas
<div className="hidden md:block">
  <DataTable ... />
</div>
<div className="md:hidden space-y-3">
  {rows.map(row => <MobileCard key={row.id} row={row} />)}
</div>
```

---

## Padrões TypeScript

```typescript
// ✅ Sempre tipar callbacks de map
rows.map((item: (typeof rows)[number]) => ...)

// ✅ Transações Prisma
await prisma.$transaction(async (tx: typeof prisma) => { ... })

// ✅ Conversão de BigInt para número
total_time_ms: row.total_time_ms ? Number(row.total_time_ms) : null

// ✅ Campos opcionais do Prisma com cast seguro
const value = (row as { field?: string | null } | null)?.field ?? null
```

---

## Processo de Build — Correção de Erros TypeScript

**Nunca fazer build incremental (build → corrige 1 → build → corrige 1...)**

**Processo correto:**
1. `npm run build` uma única vez
2. Capturar TODOS os erros
3. Classificar por padrão (missing type, wrong import, etc.)
4. Corrigir em lote por padrão
5. `npm run build` para validar

---

## Pitfalls Conhecidos

- `auth.ts` usa import relativo `./db` — não será afetado por bulk replace de `@/lib/db`
- `.next/dev/types/validator.ts` fica stale após mudanças de rota — `rm -rf .next` resolve
- `OneDrive` path com espaços quebra PowerShell `sed` — usar Git Bash
- Campos `BigInt` do Prisma devem ser convertidos antes de serializar para JSON
- `"use client"` em layout quebra Server Components filhos — evitar
- Sempre exportar tipos compartilhados de um único arquivo (evita "two different types" no build)

---

## Referências

- [ARQUITETURA.md](./ARQUITETURA.md) — visão completa
- [BRAIN/references/](./BRAIN/references/) — padrões detalhados
- [TEMPLATES/](./TEMPLATES/) — templates de módulo prontos
- [INSTRUCTIONS.md](./INSTRUCTIONS.md) — workflow de desenvolvimento