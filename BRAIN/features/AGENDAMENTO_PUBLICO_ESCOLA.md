# Agendamento público por escola (`/escola/[slug]/agendar/[slotId]`)

## Resumo

Fluxo em que o visitante escolhe um horário na agenda pública e conclui o agendamento num wizard (login/registo → tipo de aula → confirmação). A API [`POST /api/booking`](../../src/app/api/booking/route.ts) exige sessão válida.

## Sessão já existente

**Comportamento:** a página server [`agendar/[slotId]/page.tsx`](../../src/app/(public)/(public-schools)/escola/[orgSlug]/agendar/[slotId]/page.tsx) chama `auth()`. Se existir utilizador na sessão, o cliente [`BookingWizard`](../../src/app/(public)/(public-schools)/escola/[orgSlug]/agendar/[slotId]/booking-wizard.tsx):

- Inicia no passo **tipo de aula** (créditos / avulsa / pacote novo), não no passo login/registo.
- Carrega créditos via `GET /api/student/packages` no mount.
- **Voltar** no primeiro passo visível redireciona para `/escola/[slug]/agenda` em vez de mostrar o formulário de credenciais.
- Texto introdutório neutro: *"Escolha como deseja agendar sua aula."*

**Alinhamento com o site público:** o layout já mostra **App** / sessão no [`PublicSiteHeader`](../../src/components/layout/public-site-header.tsx); saltar o passo auth evita contradizer essa UI.

**Regra de produto:** qualquer role com sessão válida salta o passo (alinhado à API, que usa `session.user.id` e `ensureStudentForOrganization`). Para restringir só a `student`, seria necessário condicionar `initialAuthenticated` ao role no servidor.

## Sessão expirada durante o fluxo

Se `POST /api/booking` responder **401**, o wizard mostra toast e volta ao passo de autenticação.

## Referências

- Middleware: `/escola` é rota pública — [`middleware.ts`](../../src/middleware.ts).
- Bottom nav oculta no path do wizard — [`public-bottom-nav.tsx`](../../src/components/layout/public-bottom-nav.tsx) (`isBookingWizardPath`).

**Última atualização:** 2026-04-14
