# Checklist — Criar Novo Módulo

Use este checklist sempre que adicionar um novo recurso ao projeto.

**Módulo:** _______________
**Data:** _______________
**Sprint:** _______________

---

## 1. Banco de Dados

- [ ] Criar migration: `npx prisma migrate dev --name add_<tabela>`
- [ ] Confirmar campos: `id`, `uuid`, `client_id`, `created_at`, `updated_at`, `deleted_at`
- [ ] Confirmar soft delete (`deleted_at`)
- [ ] `npx prisma generate` após a migration

## 2. Domain Layer

- [ ] Criar `src/domain/<modulo>/<feature>/types.ts`
  - Interface principal do recurso
  - Interface com relations (se necessário)
- [ ] Criar `src/domain/<modulo>/<feature>/schema.ts`
  - Schema Zod para create
  - Schema Zod para update (parcial)
- [ ] Criar `src/domain/<modulo>/<feature>/repo.ts`
  - `list()` — com filtros e paginação
  - `getById()` / `getByUuid()`
  - `create()`
  - `update()`
  - `remove()` — soft delete (`deleted_at = now()`)

## 3. Server Actions

- [ ] Criar `src/app/(app)/<modulo>/actions.ts`
  - `"use server"` no topo
  - `listAction()` — revalidatePath não necessário (só leitura)
  - `createAction()` — requireActionPermission + validate + repo + revalidatePath
  - `updateAction()` — idem
  - `deleteAction()` — idem
  - Cada action: try/catch + toast-friendly return

## 4. UI — Listagem

- [ ] Criar `src/app/(app)/<modulo>/columns.tsx`
  - Usar `SortableHeader` nas colunas ordenáveis
  - Coluna de ações com DropdownMenu (Editar, Excluir)
  - `meta: { label }` em cada coluna
- [ ] Criar `src/app/(app)/<modulo>/page.tsx`
  - `async` Server Component
  - `requirePermission()` no topo
  - Fetch de dados + passar para client
- [ ] Criar `src/app/(app)/<modulo>/<feature>-client.tsx`
  - `"use client"`
  - `DataTable` com search + sort + column visibility
  - Botão de criar (abre Sheet/Drawer)
  - Estado: `isOpen`, `editingItem`

## 5. UI — Formulário

- [ ] Criar formulário (Sheet para desktop / Drawer para mobile)
  - `React Hook Form` + resolver Zod
  - Campos com `FormField`, `FormItem`, `FormLabel`, `FormMessage`
  - Submit chama `createAction` ou `updateAction`
  - Loading state no botão de submit
  - `onSuccess`: fechar + toast + revalidar lista

## 6. UI — Deleção

- [ ] `AlertDialog` de confirmação
  - Texto: "Esta ação não pode ser desfeita."
  - Botão destrutivo: `variant="destructive"`
  - `onConfirm`: chama `deleteAction` + toast

## 7. RBAC

- [ ] Adicionar resource em `src/lib/rbac/resources.ts`
  ```typescript
  { resource: "<feature>", module: "<modulo>", label: "..." }
  ```
- [ ] Verificar que `requirePermission("<feature>", "view")` está na page
- [ ] Verificar que `requireActionPermission("<feature>", "edit")` está nas actions mutáveis

## 8. Navegação

- [ ] Adicionar link no sidebar (`src/components/layout/sidebar.tsx`)
- [ ] Adicionar no bottom nav se for item principal (`src/components/layout/bottom-nav.tsx`)
- [ ] Testar rota mobile + desktop

## 9. Validação Final

- [ ] `npm run build` — zero erros
- [ ] Testar create → list → edit → delete
- [ ] Testar com usuário sem permissão (deve redirecionar)
- [ ] Testar em viewport mobile (375px)

## 10. Documentação

- [ ] Atualizar `ARQUITETURA.md` — adicionar na tabela de módulos
- [ ] Atualizar `BRAIN/sprints/SPRINT<N>.md` com o que foi feito