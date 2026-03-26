# Super Admin — Usuários, dashboard e sidebar

## Objetivo

1. **Visão global de usuários:** além da lista só de alunos (`/super-admin/alunos`), o super admin passa a ter **`/super-admin/usuarios`** com **todos** os perfis (`users.role`: superadmin, admin, instructor, student, service_provider).
2. **Gestão básica:** edição de **nome** e **telefone** de terceiros (não do próprio usuário logado pela mesma tela).
3. **Dashboard:** KPI de contagem total de usuários e atalho “Ver Usuários”.
4. **Sidebar:** remoção do botão “Voltar de Escola” (fluxo pouco usado; troca de org continua disponível via API/outros fluxos se necessário).

---

## Módulos e arquivos

| Área | Caminho |
|------|---------|
| Página | `src/app/(super-admin)/super-admin/usuarios/page.tsx` |
| Cliente | `src/app/(super-admin)/super-admin/usuarios/usuarios-client.tsx` |
| API | `src/app/api/super-admin/users/update/route.ts` |
| Dashboard | `src/app/(super-admin)/super-admin/page.tsx` |
| Sidebar | `src/components/layout/super-admin-sidebar.tsx` |
| Labels de perfil | `src/lib/constants.ts` → `USER_ROLE_LABELS` |
| Navegação | `SUPERADMIN_NAV_ITEMS` (item “Usuários”, ícone `UserCircle`) |

---

## Regras de negócio — tela Usuários

1. **Autorização:** apenas `role === "superadmin"` (`requireSuperAdmin` na page; API valida o mesmo).
2. **Listagem:** `users` com `deleted_at: null`, com `members` ativos e organizações para filtro e coluna “Escolas”.
3. **Filtros:** por **perfil** (role) e por **organização** (usuário com member naquela org).
4. **Busca:** nome, email, telefone, nome de escola.
5. **Tabela:** colunas nome, email, telefone, perfil (badge), escolas, último acesso, ações.
6. **Editar:** abre dialog; **não** permitir edição da **própria** linha (API bloqueia edição do `session.user.id`; UI oculta ícone de lápis na linha do usuário atual — prop `currentUserId`).

### API `POST /api/super-admin/users/update`

- Body (Zod): `{ userId: number, name?: string, phone?: string | "" }`.
- **Não** alterar email, senha ou role nesta rota (escopo mínimo).
- `phone` vazio → gravado como `null`.

---

## Dashboard (KPI)

- Inclui card **Usuários** com `prisma.users.count({ deleted_at: null })`.
- Grid de KPIs ajustado para acomodar o novo card (`lg:grid-cols-5` onde aplicável).
- Ação rápida **“Ver Usuários”** → `/super-admin/usuarios`.

---

## Sidebar

- Removidos: botão “Voltar de Escola”, `handleExitOrg`, `useRouter` usado só para isso.
- Mantido: item de menu com ícone `Store` para **Escolas** (import de `Store` permanece).

---

## Fora de escopo

- Promoção/rebaixamento de roles (impacta `students`, `instructors`, etc.).
- Exclusão lógica (`deleted_at`) pelo super admin nesta tela.

---

## Referências

- RBAC: `BRAIN/references/RBAC_PATTERN.md`
