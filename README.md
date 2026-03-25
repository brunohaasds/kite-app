# Kite App — Gestão de Escolas de Kitesurf

Plataforma de gestão operacional para escolas de kitesurf. Migração do MVP mockup para produção v1.

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **TypeScript 6** (strict mode)
- **Prisma 7** (PostgreSQL, driver adapters)
- **NextAuth v5** (Auth.js, JWT + CredentialsProvider)
- **shadcn/ui** (Radix primitives)
- **Tailwind CSS v4** (mobile-first)
- **Sonner** (toast notifications)
- **Zod** (schema validation)
- **lucide-react** (icons)

## Quick Setup

```bash
# Install dependencies
npm install

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
├── domain/                 # Domain layer (7 modules)
│   ├── organizations/      # repo, types, schema
│   ├── spots/
│   ├── users/              # repo, types, schema, service
│   ├── packages/
│   ├── sessions/
│   ├── agendas/
│   └── payments/
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
- `/escola/[id]` — School landing page
- `/escola/[id]/agenda` — Public agenda
- `/escola/[id]/agendar/[slotId]` — Booking form
- `/agendamento/confirmado` — Booking confirmation
- `/login` — Login page

### Student (auth required)
- `/aluno/aulas` — My lessons
- `/aluno/pacotes` — My packages
- `/aluno/conta` — Account settings
- `/agenda/[agendaId]` — Shared agenda

### Admin (admin role required)
- `/admin/agenda` — Today's schedule
- `/admin/agenda/nova` — Create/publish agenda
- `/admin/alunos` — Student list
- `/admin/aluno/[id]` — Student detail
- `/admin/pacotes` — Package management
- `/admin/financeiro` — Financial overview

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:migrate   # Prisma migrate dev
npm run db:generate  # Prisma generate
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```
