# BRAIN — eKite (kite-app)

Documentação técnica, planejamento, análises e referências.

Conforme [INSTRUCTIONS.md](../INSTRUCTIONS.md) — **Padrões de Documentação**:
- **Feature** → `BRAIN/features/<FEATURE>.md` (detalhamento de módulos e regras)
- **Decisão arquitetural** → `ARQUITETURA.md` (seção Decisões)
- **Sprint concluída** → `BRAIN/sprints/SPRINT<N>.md`

---

## ✨ [features/](features/) — Funcionalidades entregues

Índice e links: **[features/README.md](features/README.md)**

| Documento | Conteúdo |
|-----------|----------|
| [ADMIN_AGENDA_E_SESSOES.md](features/ADMIN_AGENDA_E_SESSOES.md) | Agenda admin: abas, agendamento escola, APIs |
| [SESSOES_BOOKING_SOURCE.md](features/SESSOES_BOOKING_SOURCE.md) | Campo `booking_source`, migration, regras |
| [SUPER_ADMIN_USUARIOS.md](features/SUPER_ADMIN_USUARIOS.md) | Super Admin: usuários, API, dashboard, sidebar |
| [LANDING_PUBLICA_SPOT_ESCOLA.md](features/LANDING_PUBLICA_SPOT_ESCOLA.md) | `/spot/[slug]`, `/escola/[id]`, parceiros |
| [BUILD_DEPLOY_VERCEL.md](features/BUILD_DEPLOY_VERCEL.md) | Prisma `postinstall`, build Vercel, env |

Antes de implementar uma feature **nova** e complexa, pode-se criar `BRAIN/features/PLANNING_<NOME>.md` (opcional).

---

## 📚 [references/](references/) — Padrões & Guias

| Arquivo | Conteúdo |
|---------|---------|
| **RBAC_PATTERN.md** | Controle de acesso: roles, two-layer model, permissões |
| **PADRAO_FORM_MODE.md** | Create/Edit/Delete: Sheet, React Hook Form, AlertDialog |
| **TYPESCRIPT_BEST_PRACTICES.md** | Pitfalls TypeScript + Prisma conhecidos |
| **DEPLOYMENT_STRATEGY.md** | Git flow, Vercel, migrations, variáveis de ambiente |

---

## 🔍 [Analysis/](analysis/) — Decisões & Análises

Criar `BUGFIX_<DESCRICAO>.md` para bugs importantes.  
Criar `DECISAO_<TEMA>.md` para decisões pontuais (alternativa à tabela em `ARQUITETURA.md`).

---

## 📋 [sprints/](sprints/) — Histórico

Criar `SPRINT<N>.md` ao finalizar cada sprint (resumo do que entrou, riscos, follow-ups).

---

## 🚀 Navegação rápida

| Preciso de... | Ir para |
|---|---|
| Índice de features | [features/README.md](features/README.md) |
| Arquitetura geral | [../ARQUITETURA.md](../ARQUITETURA.md) |
| Instruções de dev | [../INSTRUCTIONS.md](../INSTRUCTIONS.md) |
| Novo módulo | [../TEMPLATES/CHECKLIST_NOVO_MODULO.md](../TEMPLATES/CHECKLIST_NOVO_MODULO.md) |
| Padrão de formulário | [references/PADRAO_FORM_MODE.md](references/PADRAO_FORM_MODE.md) |
| RBAC | [references/RBAC_PATTERN.md](references/RBAC_PATTERN.md) |
| Deploy | [references/DEPLOYMENT_STRATEGY.md](references/DEPLOYMENT_STRATEGY.md) |
| TypeScript / Prisma | [references/TYPESCRIPT_BEST_PRACTICES.md](references/TYPESCRIPT_BEST_PRACTICES.md) |

---

**Last updated:** 2026-03-25
