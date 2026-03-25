# TypeScript Best Practices

**Last Updated:** [DATA]

Aprendizados acumulados. Seguir para evitar erros de build.

---

## 1. Callbacks de map — sempre tipar

```typescript
// ✅
rows.map((item: (typeof rows)[number]) => item.name)

// ❌ TypeScript pode inferir errado em casos complexos
rows.map((item) => item.name)
```

---

## 2. Transações Prisma — tipar o tx

```typescript
// ✅
await prisma.$transaction(async (tx: typeof prisma) => {
  await tx.table.create({ ... });
  await tx.other.update({ ... });
});

// ❌ tx: any esconde erros
await prisma.$transaction(async (tx: any) => { ... });
```

---

## 3. BigInt → Number antes de serializar

```typescript
// Prisma retorna BigInt para campos numéricos grandes
// JSON.stringify não suporta BigInt

// ✅
const value = row.total_ms ? Number(row.total_ms) : null;

// ❌ Vai quebrar no runtime
JSON.stringify({ total: row.total_ms }); // Error: BigInt não é serializável
```

---

## 4. Campos opcionais do Prisma — cast seguro

```typescript
// ✅ Cast com fallback
const name = (row as { name?: string | null } | null)?.name ?? "—";

// ✅ Para JSONB
const settings = (row.settings as Record<string, unknown> | null) ?? {};
```

---

## 5. Tipos compartilhados — exportar de um único arquivo

```typescript
// ✅ Exportar de um lugar
// domain/modulo/feature/types.ts
export interface MyRow { ... }

// Em outros arquivos: importar deste único lugar
import type { MyRow } from "@/domain/modulo/feature/types";

// ❌ Definir interface local em múltiplos arquivos
// Causa erro: "Two different types with this name exist but are unrelated"
```

---

## 6. Server Actions — sempre "use server" no topo do arquivo

```typescript
// ✅
"use server";

export async function myAction() { ... }

// ❌ Não colocar em cada função
export async function myAction() {
  "use server"; // Só funciona dentro de Client Components, não em módulos
}
```

---

## 7. Prisma — não usar `as const` em mutations

```typescript
// ✅
prisma.table.create({ data: { status: "active" } });

// ❌ as const cria tipos literais que conflitam com o tipo esperado pelo Prisma
prisma.table.create({ data: { status: "active" as const } });
```

---

## 8. Date → string para DataTable/JSON

```typescript
// Prisma retorna Date, mas DataTable serializa para string
// ✅
{
  created_at: row.created_at ? row.created_at.toISOString() : null,
}

// ❌ Date não é serializável por padrão via Server Actions
{ created_at: row.created_at } // Erro de tipo em alguns contextos
```

---

## 9. Tipos "Two different types" — causa e solução

**Sintoma:** `Type 'X' is not assignable to type 'X'. Two different types with this name exist but are unrelated.`

**Causa:** Mesma interface definida em dois arquivos diferentes.

**Solução:**
```typescript
// arquivo-a.ts
export interface MyRow { ... } // ← exportar

// arquivo-b.ts
import type { MyRow } from "./arquivo-a"; // ← importar, não redefinir
```

---

## 10. Limpar cache Next.js quando tipos ficam stale

```bash
rm -rf .next
npm run dev
```

Ocorre após renomear rotas ou mover arquivos.
