# Estratégia de Deploy

**Last Updated:** [DATA]

---

## Ambientes

| Ambiente | Branch | URL | Banco |
|----------|--------|-----|-------|
| Produção | `main` | app.seudominio.com | Supabase/Neon prod |
| Preview | `feat/*` | auto Vercel | Supabase/Neon staging |
| Local | — | localhost:3000 | Docker / Supabase local |

---

## Setup Inicial (novo projeto)

```bash
# 1. Clonar e instalar
git clone <repo>
cd <projeto>
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Migrations
npx prisma migrate dev
npx prisma generate

# 4. Seed (opcional)
npx prisma db seed

# 5. Rodar
npm run dev
```

---

## Variáveis de Ambiente Obrigatórias

```env
# .env.local

DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"

# Opcional — se usar upload de arquivos
NEXT_PUBLIC_STORAGE_URL="..."
```

---

## Deploy na Vercel

1. Conectar repositório no dashboard Vercel
2. Configurar variáveis de ambiente no projeto
3. Push para `main` → deploy automático
4. Push para `feat/*` → preview deploy automático

```bash
# Deploy manual (se necessário)
vercel --prod
```

---

## Migrations em Produção

```bash
# Nunca rodar migrate dev em produção
# Usar sempre:
npx prisma migrate deploy

# Em CI/CD (Vercel build command):
npx prisma migrate deploy && npm run build
```

---

## Git Flow

```bash
# Feature nova
git checkout -b feat/nome-feature
git commit -m "feat: descrição"
git push origin feat/nome-feature
# → Criar PR → Review → Merge para main

# Fix urgente
git checkout -b fix/descricao
git commit -m "fix: descrição"
# → PR direto para main com review rápido
```

---

## Checklist pré-deploy

- [ ] `npm run build` sem erros
- [ ] Migrations testadas localmente
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Seed de dados iniciais (se necessário)
- [ ] Testar fluxos críticos no preview antes de ir para prod
