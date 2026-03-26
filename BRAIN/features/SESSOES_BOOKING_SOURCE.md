# Sessões — `booking_source` (origem do agendamento)

## Objetivo

Registrar **quem originou** o agendamento da aula: **aluno** (self-service) ou **escola** (admin), para métricas, auditoria e UI (ex.: badge “Pela escola”).

---

## Modelo de dados

| Campo | Tipo | Default | Valores |
|-------|------|---------|---------|
| `sessions.booking_source` | `String` (VARCHAR) | `'student'` | `student` \| `admin` |

- **Migration:** `prisma/migrations/20260325120000_sessions_booking_source/migration.sql`
- **Schema:** `prisma/schema.prisma` → model `sessions`

---

## Regras

1. **Agendamento pelo aluno** (`POST /api/booking` e fluxos equivalentes que criam sessão no booking): definir `booking_source: "student"`.
2. **Agendamento pelo admin** (`POST /api/admin/sessions/book`): definir `booking_source: "admin"`.
3. Sessões criadas por outros caminhos legados devem ser revisadas — idealmente padronizar default `student` na migration para linhas antigas (já coberto pelo `DEFAULT` no SQL).

---

## APIs / pontos de escrita

| Rota | Valor típico |
|------|----------------|
| `src/app/api/booking/route.ts` | `student` |
| `src/app/api/admin/sessions/book/route.ts` | `admin` |

> **Nota:** Outras rotas que criam `sessions` (ex.: `api/booking/slot/route.ts`) podem não setar `booking_source`; convém alinhar ao mesmo padrão em refino futuro.

---

## UI

- Onde aplicável, exibir indicador visual quando `booking_source === "admin"` (ex.: badge “Pela escola” nos cards da agenda).

---

## Deploy / migrate

- Ambientes que já tinham schema antigo: rodar `npx prisma migrate deploy` após deploy do código que espera a coluna.

---

## Referências

- [ADMIN_AGENDA_E_SESSOES.md](./ADMIN_AGENDA_E_SESSOES.md)
