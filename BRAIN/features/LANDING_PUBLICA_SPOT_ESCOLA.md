# Landing pública — Spot global e Escola

## Objetivo

1. **`/spot/[slug]`** (ex.: Jericoacoara): página pública do **global spot**, com experiência visual alinhada à landing da escola e suporte a **imagem de hero** opcional.
2. **`/escola/[id]`:** landing da escola mantida como referência de layout (hero, cards, instrutores, horários).
3. **Parceiros (prestadores):** listagem ao **final** da página em ambos os contextos; textos explicativos longos removidos para UI mais limpa.

---

## Spot — `/spot/[slug]`

### Arquivos

- `src/app/(public)/spot/[slug]/page.tsx`
- Dados: `findBySlug` (`domain/global-spots/repo`), `listForGlobalSpot` (serviços parceiros), slots próximos, escolas ligadas.

### Hero (alinhado à escola)

- Container: **`MobileContainer`** (`max-w-[480px]`), como `/escola/[id]`.
- Dimensões: `h-[35vh] min-h-[280px] overflow-hidden`.
- Fundo base: `bg-gradient-to-br from-primary/30 to-primary/10`.
- **Imagem opcional:** se `global_spots.image` (URL) existir, renderizar como camada absoluta `object-cover` atrás do gradiente.
- Overlay: `bg-gradient-to-t from-black/60 via-black/20 to-transparent` (igual escola).
- Conteúdo inferior: título, badge Público/Privado, link para spot pai se houver.
- **Voltar:** link para `/` no canto superior esquerdo (`absolute top-6 left-6`).

### Conteúdo abaixo do hero

- Descrição, serviços/dicas, sub-spots, escolas, próximas aulas, **por último** bloco **Parceiros neste spot** (cards `PartnerServiceCard`).
- Sem parágrafo introdutório longo sobre prestadores (removido).

---

## Escola — `/escola/[id]`

### Arquivos

- `src/app/(public)/escola/[id]/page.tsx`

### Parceiros

- Seção **Parceiros** movida para **depois** do rodapé (site/Instagram), no **fim** da página.
- Removido texto do tipo “Prestadores vinculados a esta escola — …”.

---

## Prestadores — regras de exibição

- Aluno logado pode solicitar serviço pelo app quando `canRequestPartner` (role `student`) — lógica nos componentes de card existentes.
- Conteúdo depende de `listForGlobalSpot` / `listForOrganization` no domínio de serviços.

---

## Referências

- Deploy / imagens remotas: `next.config.ts` → `images.remotePatterns` se usar `next/image` no futuro; hoje pode usar `<img>` com URLs absolutas.
