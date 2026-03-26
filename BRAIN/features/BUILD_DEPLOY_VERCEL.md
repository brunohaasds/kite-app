# Build, Prisma gerado e deploy (Vercel)

## Objetivo

Garantir que o build na **Vercel** (e qualquer CI) encontre o **cliente Prisma** gerado em `src/generated/prisma`, que **não** é versionado (`.gitignore`), e documentar variáveis críticas.

---

## Prisma — client custom output

- Em `prisma/schema.prisma`, o generator usa `output = "../src/generated/prisma"`.
- Imports na aplicação: `@/generated/prisma/client` (ex.: `src/lib/db.ts`).

### Script `postinstall`

Em `package.json`:

```json
"postinstall": "prisma generate"
```

Assim, após `npm install` no build da Vercel, o diretório `src/generated/prisma` é criado antes de `next build`.

---

## Problemas conhecidos

### `Module not found` para `@/generated/prisma/client` no deploy

- **Causa:** build sem `prisma generate` (antes do `postinstall`).
- **Correção:** manter `postinstall`; confirmar que o install não usa `--ignore-scripts`.

### `.next/dev/types/routes.d.ts` corrompido (TypeScript “Unexpected keyword”)

- **Causa:** cache local do Next em `.next` com arquivo de rotas gerado inválido.
- **Correção local:** apagar pasta `.next` e rodar `npm run build` de novo.

---

## Variáveis de ambiente (Vercel)

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Runtime + necessário para `prisma.config.ts` / ferramentas Prisma no build |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Auth.js |
| `NEXTAUTH_URL` / `AUTH_URL` | URL canônica em **produção** (não usar `http://localhost:3000` em “All Environments”) |
| `AUTH_TRUST_HOST` | Recomendado `true` em previews com URLs dinâmicas (ver discussão em produto) |

Detalhes de fluxo Git e migrate: `BRAIN/references/DEPLOYMENT_STRATEGY.md` (atualizado com nota de `postinstall`).

---

## Middleware / Next.js 16

- O projeto pode ainda usar `src/middleware.ts`; o Next 16 emite aviso de depreciação em favor de `proxy.ts`. Migração futura: ver documentação oficial Next.js (*Middleware to Proxy*).

---

## Referências

- [DEPLOYMENT_STRATEGY.md](../references/DEPLOYMENT_STRATEGY.md)
