# Arquitetura — eKite (kite-app)

> Documento vivo. Atualizar sempre que adicionar módulo, feature ou mudar decisão arquitetural.

**Versão:** 1.1  
**Última atualização:** 2026-04-14  
**Status:** Em produção / evolução contínua

---

## Stack tecnológica

| Camada | Tecnologia | Versão | Observação |
|--------|------------|--------|------------|
| Framework | Next.js | 16.x | App Router + Turbopack (`next dev --turbopack`) |
| Runtime | Node.js | 20+ | |
| Linguagem | TypeScript | 6.x | strict mode |
| ORM | Prisma | 7.x | PostgreSQL (`@prisma/adapter-pg`) |
| Auth | NextAuth (Auth.js) | 5.x beta | Credentials + JWT/session |
| UI | shadcn/ui + Radix | latest | |
| CSS | Tailwind CSS | 4.x | Mobile-first |
| Forms | React Hook Form + Zod | latest | Schemas em `domain/**/schema.ts` |
| Tabelas | TanStack Table | 8.x | |
| Notificações | Sonner | latest | Toast |
| PWA | Serwist | 9.x | Service worker + precache (ver `BRAIN/features/PWA_INSTALACAO.md`) |
| Testes | Vitest | 4.x | `npm run test` — schemas e utilitários críticos |
| Deploy | Vercel | — | |
| Database | PostgreSQL | 16+ | Supabase / Neon |

---

## Princípios arquiteturais

1. **Mobile-first:** UI pensada primeiro para telemóvel; listagens com alternativa em cards quando aplicável.
2. **Server-first:** Server Components e Server Actions onde faz sentido; validação Zod no servidor.
3. **Domain layer:** UI → actions/API → `domain` (repo / schema / service opcional) → Prisma → DB.
4. **Type-safe:** TypeScript estrito em todo o stack.
5. **Multi-tenant / escopo:** Dados de escola e utilizadores escopados por organização (`organization_id` / contexto de sessão); super-admin com visão global conforme regras em `lib/rbac`.

---

## Fluxo de dados (obrigatório)

```
UI (Client) → Server Action ou Route Handler → domain (repo/service) → Prisma → DB
```

Em Server Actions: `requireActionPermission` → Zod → repo → `revalidatePath` → resposta.

---

## Estrutura de pastas (resumo)

```
src/
├── app/
│   ├── (public)/           # Marketing, spots, escolas públicas, auth (/login, /cadastro)
│   ├── (app)/              # Área autenticada — aluno, instrutor (mobile shell + bottom nav)
│   ├── (admin)/admin/      # Consola da escola (admin)
│   ├── (super-admin)/      # Operações globais
│   ├── api/                # REST: booking, upload, admin, super-admin, auth, …
│   ├── offline/            # Página offline (PWA)
│   └── serwist/            # Bundle do service worker (Serwist)
├── domain/<modulo>/        # repo.ts, schema.ts, types.ts, service.ts (opcional)
├── components/             # ui/, layout/, marketing/, módulos
├── lib/                    # auth, db, rbac, auth-routes, constantes
└── types/                  # Augmentação NextAuth
```

Detalhe de convenções: ver [CLAUDE.md](./CLAUDE.md).

---

## Autenticação e rotas

- **NextAuth v5** em `src/lib/auth.ts`; handler em `src/app/api/auth/[...nextauth]/route.ts`.
- **Middleware** (`src/middleware.ts`): rotas públicas vs. áreas por role (`/admin`, `/aluno`, `/super-admin`, `/instrutor`, `/prestador`).
- **Pós-login / callbacks:** `src/lib/auth-routes.ts` — `isSafeInternalPath`, `resolvePostLoginRedirect`, `getAppHomePath` (evitar open redirect).

---

## RBAC — papéis no código

Os valores de `user.role` usados na aplicação incluem:

| Role | Área típica |
|------|----------------|
| `superadmin` | `/super-admin/*` |
| `admin` | `/admin/*` (escola) |
| `student` | `/aluno/*` |
| `instructor` | `/instrutor/*` |
| `service_provider` | `/prestador` |

Permissões granulares e padrões: [BRAIN/references/RBAC_PATTERN.md](./BRAIN/references/RBAC_PATTERN.md) e `lib/rbac/`.

---

## Modelo de dados

A fonte de verdade é `prisma/schema.prisma` (organizações, utilizadores, alunos, agendas, sessões, pacotes, spots globais, etc.). IDs numéricos (`Int`) como PK; soft delete com `deleted_at` onde aplicável.

---

## UI e layout

- **Shell autenticado:** `MobileContainer` + `BottomNav`; em desktop, largura máxima alinhada ao site público (`md:max-w-7xl`) para consistência visual.
- **Cores de estado:** `src/lib/styles/status-colors.ts` — preferir `STATUS_COLORS` a cores soltas.

---

## APIs públicas e segurança

Várias rotas sob `/api/*` são alcançáveis sem sessão ao nível do middleware; **cada handler** deve aplicar `auth()`, escopo de organização quando relevante, e validação Zod. Endpoints internos sensíveis usam segredo Bearer (ex.: `api/internal/session-user`).

---

## Testes automatizados

- **Vitest:** `npm run test` — validação de schemas de domínio (ex.: alteração de senha, corpo de booking) e utilitários de redirect seguro em `auth-routes`.
- Testes E2E (Playwright) são opcionais para evolução futura.

---

## Documentação de funcionalidades

Índice: **[BRAIN/features/README.md](./BRAIN/features/README.md)** — inclui PWA, agendamento público, onboarding aluno, build Vercel, placeholders de produto, etc.

---

## Módulos e rotas (estado atual)

| Área | Rotas principais | Notas |
|------|------------------|--------|
| Público / marketing | `/`, `/home`, `/inicio`, `/para-escolas`, `/mapa`, `/centers`, `/spots`, `/spot/[slug]` | Exploração de spots e escolas |
| Escola pública | `/escola/[orgSlug]`, agendar, agenda, instrutor | Wizard de agendamento |
| Auth | `/login`, `/cadastro`, `/convite/[token]` | |
| Aluno | `/aluno/aulas`, `/aluno/conta`, `/aluno/pacotes`, `/aluno/mapa`, spots | Shell app |
| Instrutor | `/instrutor/agenda`, `/instrutor/conta` | |
| Prestador | `/prestador` | |
| Admin (escola) | `/admin`, `/admin/agenda`, alunos, pacotes, spots, convites, financeiro, … | |
| Super-admin | `/super-admin`, escolas, spots globais, utilizadores | |
| PWA | `/offline`, `manifest.webmanifest`, `/serwist/*` | |

---

## Decisões arquiteturais

| # | Decisão | Razão |
|---|---------|--------|
| D1 | App Router (Next.js 16) | RSC, layouts imbricados, streaming |
| D2 | Server Actions + route handlers | Actions para mutações colocated; APIs para fluxos REST/mobile |
| D3 | Prisma | Type-safety e migrações |
| D4 | shadcn/ui | Controlo do código, acessibilidade |
| D5 | Zod no domínio | Validação partilhada; schemas exportados de `domain/**/schema.ts` |
| D6 | IDs `Int` | Performance; UUID como campo público quando existir |
| D7 | Soft delete | Auditoria e recuperação |
| D8 | JSONB para settings | Flexibilidade |
| D9 | `postinstall: prisma generate` | Client gerado em CI/deploy — ver `BRAIN/features/BUILD_DEPLOY_VERCEL.md` |
| D10 | Docs em `BRAIN/features/*.md` | Rastreio por feature (INSTRUCTIONS.md) |
| D11 | Serwist para PWA | SW compatível com Turbopack; cache conservador |
| D12 | Vitest para smoke de domínio | Regressão rápida em schemas e redirects sem custo E2E |

---

## Notas de versionamento

### v1.1 — 2026-04-14

- Stack e tabela de módulos alinhadas ao repositório (Next 16, Prisma 7, papéis reais).
- Documentados PWA, Vitest, `auth-routes`, escopo de APIs públicas.

### v1.0 — Inicial (template)

- Estrutura base e padrões iniciais do projeto.
