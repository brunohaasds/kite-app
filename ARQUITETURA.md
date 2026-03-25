# Arquitetura — [Nome do Projeto]

> Documento vivo. Atualizar sempre que adicionar módulo, feature ou mudar decisão arquitetural.

**Versão:** 1.0
**Última Atualização:** [DATA]
**Status:** Inicial

---

## Stack Tecnológica

| Camada | Tecnologia | Versão | Observação |
|--------|-----------|--------|-----------|
| Framework | Next.js | 15.x | App Router + Turbopack |
| Runtime | Node.js | 20+ | |
| Linguagem | TypeScript | 5.x | strict mode |
| ORM | Prisma | 6.x | PostgreSQL |
| Auth | NextAuth (Auth.js) | 5.x | JWT + Sessions |
| UI Components | shadcn/ui | latest | Radix UI primitives |
| CSS | Tailwind CSS | 4.x | Mobile-first |
| Forms | React Hook Form + Zod | latest | |
| Tabelas | TanStack Table | 8.x | |
| Notificações | Sonner | latest | Toast |
| Deploy | Vercel | — | Edge runtime |
| Database | PostgreSQL | 16+ | Supabase / Neon |

---

## Princípios Arquiteturais

1. **Mobile-First:** Toda UI pensada primeiro para telas pequenas
2. **Server-First:** Máximo de lógica no servidor (Server Components, Server Actions)
3. **Domain Layer:** Separação clara entre UI, orquestração e dados
4. **Type-Safe:** TypeScript estrito em todo o stack
5. **Multi-tenant ready:** Isolamento por `client_id` desde o início (se aplicável)

---

## Arquitetura de Camadas

```
┌─────────────────────────────────────────────┐
│  UI Layer (React Server + Client Components) │
│  app/(app)/<modulo>/page.tsx                 │
│  app/(app)/<modulo>/<feature>-client.tsx     │
├─────────────────────────────────────────────┤
│  Orchestration Layer (Server Actions)        │
│  app/(app)/<modulo>/actions.ts              │
│  → auth → validate → domain → revalidate    │
├─────────────────────────────────────────────┤
│  Domain Layer (Business Logic)              │
│  domain/<modulo>/<feature>/                 │
│  ├── repo.ts    (Prisma queries)            │
│  ├── service.ts (business logic, optional)  │
│  ├── schema.ts  (Zod validators)           │
│  └── types.ts   (TypeScript interfaces)    │
├─────────────────────────────────────────────┤
│  Data Layer                                 │
│  PostgreSQL + Prisma ORM                    │
└─────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (public)/              # Rotas públicas
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (app)/                 # Rotas autenticadas (mobile-first layout)
│   │   ├── layout.tsx         # Shell com bottom nav (mobile) / sidebar (desktop)
│   │   ├── dashboard/
│   │   └── <modulo>/
│   │       ├── page.tsx
│   │       ├── actions.ts
│   │       ├── columns.tsx
│   │       └── <feature>-client.tsx
│   ├── api/
│   │   └── auth/              # NextAuth route handler
│   └── layout.tsx             # Root layout (providers)
│
├── domain/
│   └── <modulo>/
│       └── <feature>/
│           ├── repo.ts
│           ├── schema.ts
│           ├── types.ts
│           └── service.ts     # Opcional — só se lógica complexa
│
├── components/
│   ├── ui/                    # shadcn/ui (não editar diretamente)
│   ├── layout/
│   │   ├── app-shell.tsx      # Layout principal app
│   │   ├── bottom-nav.tsx     # Navegação mobile
│   │   ├── sidebar.tsx        # Sidebar desktop
│   │   └── top-bar.tsx        # Header mobile
│   ├── data-table/            # DataTable reutilizável
│   │   ├── data-table.tsx
│   │   └── sortable-header.tsx
│   └── <modulo>/              # Componentes específicos
│
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── db.ts                  # Prisma singleton
│   ├── rbac/
│   │   ├── permission-rules.ts
│   │   ├── load-permissions.ts
│   │   └── require-permission.ts
│   ├── styles/
│   │   └── status-colors.ts   # STATUS_COLORS centralizado
│   └── utils.ts               # cn(), formatters
│
└── types/
    └── index.ts               # NextAuth type augmentation
```

---

## Autenticação (NextAuth v5)

### Configuração básica

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [CredentialsProvider({ ... })],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clientId = user.clientId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

### Type augmentation obrigatório

```typescript
// src/types/index.ts
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    clientId?: number | null;
  }
  interface Session {
    user: User & { id: string; role: string; clientId?: number | null };
  }
}
```

---

## RBAC — Controle de Acesso

### Roles disponíveis

| Role | Descrição | Acesso |
|------|-----------|--------|
| `super_admin` | Admin global do sistema | Tudo, sem restrição de cliente |
| `admin` | Admin do cliente | Gerencia usuários e configs do cliente |
| `user` | Usuário regular | Permissões configuráveis via profile |

### Implementação

Ver [BRAIN/references/RBAC_PATTERN.md](./BRAIN/references/RBAC_PATTERN.md) para detalhes completos.

---

## Modelo de Dados — Tabelas Base

```prisma
// Tabelas presentes em todos os projetos com este template

model clients {
  id         Int       @id @default(autoincrement())
  uuid       String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  name       String    @db.VarChar(255)
  settings   Json?     // JSONB — configurações flexíveis
  created_at DateTime? @db.Timestamp(0)
  updated_at DateTime? @db.Timestamp(0)
  deleted_at DateTime? @db.Timestamp(0)
}

model users {
  id         Int       @id @default(autoincrement())
  uuid       String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  client_id  Int?
  name       String    @db.VarChar(255)
  email      String    @unique @db.VarChar(255)
  password   String    @db.VarChar(255)
  role       String    @db.VarChar(50)  // super_admin | admin | user
  created_at DateTime? @db.Timestamp(0)
  updated_at DateTime? @db.Timestamp(0)
  deleted_at DateTime? @db.Timestamp(0)

  client  clients?  @relation(fields: [client_id], references: [id])
}

// Sem profiles — permissões definidas por role no código (ROLE_RULES)
```

---

## Padrões de JSONB

Usado para configurações flexíveis sem migrações:

```typescript
// Sempre validar com Zod ao ler
import { z } from "zod";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  notifications: z.boolean().default(true),
}).catch({ theme: "light", notifications: true });

// Leitura segura
const settings = settingsSchema.parse(client.settings ?? {});
```

---

## Sistema de Cores de Status

Centralizado em `src/lib/styles/status-colors.ts`. **Nunca usar cores hardcoded** — sempre referenciar `STATUS_COLORS`.

```typescript
export const STATUS_COLORS = {
  // Adaptar para os status do domínio do projeto
  active:   { hex: "#22c55e", label: "Ativo",   bgClass: "bg-green-500 text-white" },
  inactive: { hex: "#94a3b8", label: "Inativo",  bgClass: "bg-slate-200 text-slate-700" },
  pending:  { hex: "#f59e0b", label: "Pendente", bgClass: "bg-amber-100 text-amber-800" },
} as const;
```

---

## Navegação Mobile-First

### Layout shell

```
Mobile:                    Desktop:
┌──────────────┐           ┌────────┬──────────────┐
│  Top Bar     │           │        │  Top Bar     │
├──────────────┤           │ Side   ├──────────────┤
│              │           │  bar   │              │
│   Content    │           │        │   Content    │
│              │           │        │              │
├──────────────┤           │        │              │
│  Bottom Nav  │           └────────┴──────────────┘
└──────────────┘
```

### Bottom nav (mobile)

```tsx
// components/layout/bottom-nav.tsx
// 4-5 ícones máximo — os mais usados do app
// Usar Link com active state via usePathname()
```

---

## Decisões Arquiteturais

| # | Decisão | Razão |
|---|---------|-------|
| D1 | App Router (Next.js 15) | Server Components, streaming, layouts nested |
| D2 | Server Actions (não API Routes) | Menos boilerplate, type-safe, co-location |
| D3 | Prisma sobre query builders | Type-safety + migrations automáticas |
| D4 | shadcn/ui sobre component libs | Sem vendor lock-in, customizável, acessível |
| D5 | Zod no domínio (não no form) | Validação reutilizável server+client |
| D6 | IDs como Int (não UUID como PK) | Performance de joins; UUID como campo público |
| D7 | Soft delete (`deleted_at`) | Auditoria + recuperação |
| D8 | JSONB para settings | Flexibilidade sem migrations para configs |

---

## Módulos do Sistema

> Preencher conforme o projeto for crescendo.

| Módulo | Rota | Resource | Status |
|--------|------|----------|--------|
| Admin — Usuários | `/admin/users` | `users` | ⬜ Planejado |
| Admin — Clientes | `/admin/clients` | `clients` | ⬜ Planejado |
| Dashboard | `/dashboard` | — | ⬜ Planejado |

---

## Nota de versionamento

### v1.0 — Inicial (template)
- Estrutura base definida
- Stack escolhida
- Padrões estabelecidos