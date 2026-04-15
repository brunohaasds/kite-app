# Placeholders de produto — eKite

Documento de roadmap / transparência para funcionalidades ainda não entregues ou apenas parciais na UI.

**Última atualização:** 2026-04-14

---

## Recuperação de senha (login)

- **Estado:** não há fluxo “esqueci a senha” por email (token + página de reset).
- **Hoje:** utilizadores autenticados podem alterar senha em **Conta → Alterar senha** (`/api/user/change-password`).
- **Roadmap:** integrar envio de email (ex. Resend) + página `/reset-password` com token de uso único e expiração.

---

## Avaliação do aluno (Conta)

- **Estado:** não existe modelo de avaliações agregadas na conta.
- **UI:** mostrar “—” / “Sem dados ainda” até existir métrica real (média, N avaliações, ou esconder o cartão).

---

## Notificações

- **Estado:** centro de notificações in-app não implementado.
- **UI:** entrada marcada como indisponível em vez de “Em breve” vago.
- **Roadmap:** preferências por canal, fila de eventos (agenda, pacotes), ou integração com push web (PWA) — a definir.

---

## Manutenção

Quando uma destas áreas for fechada, atualizar este ficheiro e a linha correspondente em [README.md](./README.md).
