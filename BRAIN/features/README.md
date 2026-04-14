# Features — eKite (kite-app)

Documentação por funcionalidade, alinhada ao padrão do projeto (**INSTRUCTIONS.md** → seção *Padrões de Documentação*: uma feature = um arquivo em `BRAIN/features/`).

| Documento | Resumo |
|-----------|--------|
| [PWA_INSTALACAO.md](./PWA_INSTALACAO.md) | Manifest, Serwist/Turbopack, `/offline`, QA instalação |
| [ALUNO_ONBOARDING.md](./ALUNO_ONBOARDING.md) | Estados sem `students`/`members`/user: painel Sair + CTA `/centers` |
| [AGENDAMENTO_PUBLICO_ESCOLA.md](./AGENDAMENTO_PUBLICO_ESCOLA.md) | Wizard `/escola/.../agendar/...`: sessão existente salta login; Voltar para agenda; 401 |
| [ADMIN_AGENDA_E_SESSOES.md](./ADMIN_AGENDA_E_SESSOES.md) | Agenda admin: abas Pendentes/Finalizadas, fluxo do dia, agendamento pela escola |
| [SESSOES_BOOKING_SOURCE.md](./SESSOES_BOOKING_SOURCE.md) | Campo `booking_source` em `sessions`, regras e APIs |
| [SUPER_ADMIN_USUARIOS.md](./SUPER_ADMIN_USUARIOS.md) | Tela Usuários, API de atualização, dashboard, sidebar |
| [LANDING_PUBLICA_SPOT_ESCOLA.md](./LANDING_PUBLICA_SPOT_ESCOLA.md) | Páginas públicas `/spot/[slug]` e `/escola/[id]`: hero, parceiros |
| [BUILD_DEPLOY_VERCEL.md](./BUILD_DEPLOY_VERCEL.md) | `postinstall` Prisma, build na Vercel, variáveis |

**Como manter:** ao encerrar uma entrega relevante, criar ou atualizar o arquivo da feature correspondente e referenciar aqui.

**Última atualização:** 2026-04-14
