# Guia UI/UX — Mobile-First

**Last Updated:** [DATA]

---

## Princípios

1. **Mobile-first:** Projetar para 375px, expandir para desktop
2. **Touch-friendly:** Áreas de toque mínimo 44×44px
3. **Performance:** Skeleton loading, não spinners
4. **Consistência:** Sempre usar componentes do shadcn/ui + tokens
5. **Acessibilidade:** Labels em todos os inputs, aria onde necessário

---

## Tokens de Design

### Tipografia

```
texto-display:  text-2xl font-bold          (títulos de página)
texto-heading:  text-lg font-semibold       (títulos de seção)
texto-body:     text-sm                     (conteúdo padrão)
texto-caption:  text-xs text-muted-foreground (rótulos, metadados)
```

### Espaçamento (padrão Tailwind)

```
gap interno card:     p-4 (mobile) / p-6 (desktop)
gap entre seções:     space-y-4 / space-y-6
gap entre itens:      gap-2 / gap-3
```

### Cores semânticas

```
Primary:     Ações principais, links, botões CTA
Muted:       Texto secundário, placeholders
Destructive: Ações de exclusão
Border:      Bordas, separadores
Background:  Fundo de cards e surfaces
```

---

## Componentes por Situação

### Listagem de dados

```tsx
// Desktop: DataTable com search + sort + paginação
<DataTable
  columns={columns}
  data={rows}
  showSearch={true}
  showColumnVisibility={true}
/>

// Mobile: lista de cards
<div className="space-y-3 md:hidden">
  {rows.map(row => <ItemCard key={row.id} item={row} />)}
</div>
<div className="hidden md:block">
  <DataTable ... />
</div>
```

### Formulários

```tsx
// Sidebar (Sheet) — padrão desktop
// Drawer — padrão mobile
// Em telas pequenas: usar Dialog com scroll interno

// Campos: sempre com label acima (nunca placeholder como label)
<FormItem>
  <FormLabel>Nome</FormLabel>
  <FormControl>
    <Input placeholder="Ex: João Silva" />
  </FormControl>
  <FormMessage />
</FormItem>
```

### Botões

```tsx
// Hierarquia visual
<Button>Ação Principal</Button>               // default — só 1 por tela
<Button variant="outline">Secundária</Button>  // outline — ações alternativas
<Button variant="ghost">Terciária</Button>     // ghost — ações de baixo peso
<Button variant="destructive">Excluir</Button> // destructive — sempre com confirm

// Mobile: botões full-width em ações principais
<Button className="w-full">Confirmar</Button>
```

### Feedback ao usuário

```tsx
// Sempre usar toast (Sonner) para feedback de ações
import { toast } from "sonner";

toast.success("Salvo com sucesso");
toast.error("Erro ao salvar. Tente novamente.");
toast.loading("Salvando...");

// Loading state em botões (nunca desabilitar sem indicar)
<Button disabled={isLoading}>
  {isLoading ? "Salvando..." : "Salvar"}
</Button>
```

### Empty states

```tsx
// Sempre mostrar estado vazio em vez de nada
{rows.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <IconeName className="h-10 w-10 text-muted-foreground mb-3" />
    <p className="text-muted-foreground">Nenhum item cadastrado.</p>
    <Button className="mt-4" onClick={handleCreate}>
      Adicionar primeiro item
    </Button>
  </div>
)}
```

---

## Layout Mobile — Shell

```
┌─────────────────────────────────┐
│ ← Título da página         [+]  │  ← TopBar (56px)
├─────────────────────────────────┤
│                                 │
│                                 │
│         Conteúdo                │  ← Área principal (scroll)
│                                 │
│                                 │
├─────────────────────────────────┤
│  [🏠]  [🔍]  [📋]  [👤]        │  ← BottomNav (64px)
└─────────────────────────────────┘
```

### Bottom Nav — regras

- Máximo 5 ícones
- Ícone + label curto (2-3 chars)
- Highlight no item ativo
- Nunca usar para ações (só navegação)

---

## Cards Mobile

```tsx
// Padrão de card para listas mobile
function ItemCard({ item }: { item: MyRow }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">
          {item.description}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

---

## Padrões a Evitar

- ❌ Texto placeholder como label de campo
- ❌ Botões sem feedback de loading
- ❌ Deletar sem confirmação
- ❌ Erros técnicos expostos ao usuário
- ❌ Listas vazias sem empty state
- ❌ Modais em cima de modais (max 1 nível)
- ❌ Scroll horizontal em mobile
