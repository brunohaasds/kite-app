# Admin — Agenda e sessões do dia

## Objetivo

Permitir que o **admin da escola** visualize e gerencie as aulas do dia selecionado, com organização clara entre aulas ainda ativas (“pendentes”) e aulas encerradas (“finalizadas”), incluindo agendamento em nome do aluno quando aplicável.

---

## Módulos e arquivos principais

| Área | Caminho |
|------|---------|
| Página servidor | `src/app/(admin)/admin/agenda/page.tsx` |
| UI cliente | `src/app/(admin)/admin/agenda/agenda-client.tsx` |
| Nova agenda | `src/app/(admin)/admin/agenda/nova/` |
| API agendamento admin | `src/app/api/admin/sessions/book/route.ts` |
| Opções de aluno/pacote | `src/app/api/admin/students/booking-options/route.ts` |
| Booking aluno (público) | `src/app/api/booking/route.ts` |

---

## Regras de negócio

### Abas Pendentes / Finalizadas

- **Pendentes (`activeSessions`):** sessões cujo `status` **não** está em: `completed`, `cancelled`, `cancelled_weather`, `cancelled_student`.
- **Finalizadas (`doneSessions`):** sessões cujo `status` está em um desses valores finais.
- **Tabs (shadcn):** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`; `TabsList` com `className="w-full sm:w-auto"` (padrão alinhado ao restante do admin).
- **Aba inicial:** se existir ao menos uma pendente → aba **Pendentes**; caso contrário → **Finalizadas** (evita abrir em vazio).
- **Estado vazio por aba:** mensagem em área tracejada (“Nenhuma aula pendente neste dia” / “Nenhuma aula finalizada ou cancelada neste dia”).

### Ações nas aulas (pendentes)

- Concluir / cancelar conforme fluxo já existente (`SessionCard`, diálogos de confirmação).
- Cards de **Finalizadas** sem ações de alteração de estado (somente leitura).

### Agendamento pela escola (admin)

- Rota dedicada: `POST /api/admin/sessions/book`.
- Autenticação: sessão **admin** (ou equivalente permitido pela rota) da organização correta.
- Após reservar o slot (`bookSlot`), cria `sessions` com `booking_source: "admin"` (ver [SESSOES_BOOKING_SOURCE.md](./SESSOES_BOOKING_SOURCE.md)).
- UI de apoio: listagem de alunos/pacotes via `booking-options` para o fluxo de escolha no cliente.

### Navegação por data

- Seletor de dia na semana com rota `?date=YYYY-MM-DD` (comportamento existente na agenda; mantido em conjunto com `agenda-client`).

---

## Fora de escopo (nesta feature)

- Alteração de regras globais de RBAC (ver `BRAIN/references/RBAC_PATTERN.md`).
- Relatórios financeiros ou lista de alunos fora do contexto da agenda.

---

## Dependências

- Prisma `sessions`, `agenda_slots`, `agendas`, alunos/pacotes conforme rotas citadas.
- Componentes UI: `@/components/ui/tabs`.

---

## Evolução sugerida

- Filtro adicional por instrutor ou spot dentro do dia.
- Exportação do dia (CSV/PDF) se produto solicitar.
