# Kite App — Gestão de Escolas de Kitesurf

Plataforma de gestão operacional para escolas de kitesurf. Migração do MVP mockup para produção v1.

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **React 19**
- **TypeScript 6** (strict mode)
- **Prisma 7** (PostgreSQL, driver adapters)
- **NextAuth v5** (Auth.js, JWT + CredentialsProvider)
- **shadcn/ui** (Radix primitives)
- **Tailwind CSS v4** (mobile-first)
- **Sonner** (toast notifications)
- **Zod** (schema validation)
- **Serwist** (PWA / service worker — ver `BRAIN/features/PWA_INSTALACAO.md`)
- **Vitest** (testes de domínio e utilitários — `npm run test`)
- **Playwright** (smoke E2E — `npm run test:e2e`)
- **lucide-react** (icons)

## Quick Setup

```bash
# Install dependencies
npm install

# Browsers Playwright (primeira vez, ou após upgrade do @playwright/test)
npx playwright install chromium

# Configure database
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx prisma db seed

# Start dev server
npm run dev
```

## Demo Credentials

| Role     | Email              | Password |
|----------|--------------------|----------|
| Admin    | admin@kiteapp.com  | 123456   |
| Student  | maria@email.com    | 123456   |
| Student  | pedro@email.com    | 123456   |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public routes (escola, agendamento, login)
│   ├── (app)/              # Authenticated student routes (aulas, pacotes, conta)
│   ├── (admin)/            # Admin routes (agenda, alunos, pacotes, financeiro)
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components (sidebar, bottom-nav, etc.)
├── domain/                 # Domain layer (exemplos)
│   ├── organizations/
│   ├── agendas/
│   ├── global-spots/
│   ├── invites/
│   ├── instructors/
│   ├── packages/
│   ├── payments/
│   ├── sessions/
│   ├── spots/
│   ├── students/
│   ├── services/
│   └── users/              # repo, types, schema, service
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma singleton
│   ├── constants.ts        # Centralized constants
│   ├── icons.ts            # Centralized icon re-exports
│   ├── utils.ts            # cn(), formatters
│   ├── styles/
│   │   ├── theme.ts        # Design tokens (colors, fonts, spacing)
│   │   └── status-colors.ts # Semantic status colors
│   └── rbac/
│       ├── permission-rules.ts
│       ├── require-permission.ts
│       └── resources.ts
├── generated/prisma/       # Prisma generated client
└── types/index.ts          # NextAuth type augmentation
```

## Route Structure

### Public (no auth)
- `/spot/[slug]`, `/spots`, `/mapa`, `/centers` — Exploração de spots
- `/escola/[orgSlug]` — Landing da escola (slug)
- `/escola/[orgSlug]/agenda` — Agenda pública
- `/escola/[orgSlug]/agendar/[slotId]` — Wizard de agendamento
- `/login`, `/cadastro` — Auth
- `/agendamento/confirmado` — Confirmação de agendamento

### Student (auth required)
- `/aluno/aulas`, `/aluno/pacotes`, `/aluno/conta`, `/aluno/mapa`, spots…

### Instructor / provider
- `/instrutor/agenda`, `/instrutor/conta`
- `/prestador` — Prestador de serviços

### Admin (school)
- `/admin`, `/admin/agenda`, `/admin/alunos`, `/admin/pacotes`, `/admin/financeiro`, …

### Super-admin
- `/super-admin`, `/super-admin/escolas`, `/super-admin/usuarios`, …

### Shared
- `/agenda/[agendaId]` — Agenda partilhada (contexto da escola)

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Vitest (schemas / utilitários críticos)
npm run test:watch   # Vitest em modo watch
npm run test:e2e     # Playwright (smoke em e2e/ — sobe dev se necessário)
npm run test:e2e:ui  # Playwright UI mode
npm run db:migrate   # Prisma migrate dev
npm run db:generate  # Prisma generate
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```
