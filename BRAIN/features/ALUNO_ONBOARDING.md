# Área do aluno — estados sem dados e recuperação

## Resumo

Utilizadores com `role: student` podem abrir `/aluno/*` antes de existir vínculo completo na base de dados. Em vez de uma única linha de texto sem ações, o app mostra o componente [`StudentRecoveryPanel`](../../src/components/student/student-recovery-panel.tsx) com explicação, **Sair** (`signOut` → `/login`) e, quando aplicável, **Ver escolas e agendar** → `/centers`.

## Registo mínimo e criação de `students`

[`registerStudentMinimal`](../../src/domain/users/service.ts) cria só `users` com `role: student`. A linha em `students` (e `members`) surge no primeiro fluxo que chama [`ensureStudentForOrganization`](../../src/domain/students/ensure.ts), p.ex. [`POST /api/booking`](../../src/app/api/booking/route.ts).

## Tabela de estados

| Variante | Onde | Condição | CTA centros |
|----------|------|----------|-------------|
| `no_student` | [`/aluno/aulas`](../../src/app/(app)/aluno/aulas/page.tsx), [`/aluno/pacotes`](../../src/app/(app)/aluno/pacotes/page.tsx) | Sem linha `students` para o `user_id` | Sim |
| `no_member` | [`/aluno/convidar`](../../src/app/(app)/aluno/convidar/page.tsx) | Sem linha `members` | Sim |
| `no_user` | [`/aluno/conta`](../../src/app/(app)/aluno/conta/page.tsx) | Sessão com id mas `users` não encontrado (raro) | Não |

O botão **Sair** está sempre disponível nestes painéis; o fluxo normal de Conta continua a oferecer Sair em [`conta-client.tsx`](../../src/app/(app)/aluno/conta/conta-client.tsx) quando a página carrega com utilizador válido.

## Alterar senha (Conta)

Com sessão ativa, **Alterar senha** abre um diálogo (senha atual + nova + confirmação). [`POST /api/user/change-password`](../../src/app/api/user/change-password/route.ts) valida com [`changePasswordSchema`](../../src/domain/users/schema.ts), confere a atual com `bcrypt.compare` e grava com [`changePasswordForAuthenticatedUser`](../../src/domain/users/service.ts). Não invalida a sessão NextAuth (o utilizador continua logado).

**Última atualização:** 2026-04-14
