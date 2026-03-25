# Padrão de Formulários — Create / Edit / Delete

**Last Updated:** [DATA]

---

## Padrão de estado no Client Component

```typescript
// Estado mínimo para gerenciar formulários
const [sheetOpen, setSheetOpen] = useState(false);
const [editingItem, setEditingItem] = useState<MyRow | null>(null);
const [deletingItem, setDeletingItem] = useState<MyRow | null>(null);
const [loading, setLoading] = useState(false);

// Abrir para criar
function handleCreate() {
  setEditingItem(null);
  setSheetOpen(true);
}

// Abrir para editar
function handleEdit(item: MyRow) {
  setEditingItem(item);
  setSheetOpen(true);
}

// Fechar
function handleClose() {
  setSheetOpen(false);
  setEditingItem(null);
}
```

---

## Sheet (desktop) / Drawer (mobile)

```tsx
// Mobile-first: usar Drawer em telas pequenas, Sheet em md+
// Ou: usar Sheet com className responsivo

<Sheet open={sheetOpen} onOpenChange={handleClose}>
  <SheetContent className="w-full sm:max-w-[480px]">
    <SheetHeader>
      <SheetTitle>{editingItem ? "Editar" : "Criar"} Item</SheetTitle>
    </SheetHeader>
    <MyForm
      initialData={editingItem}
      onSuccess={handleClose}
      onCancel={handleClose}
    />
  </SheetContent>
</Sheet>
```

---

## Formulário com React Hook Form + Zod

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchema, type CreateData } from "@/domain/modulo/feature/schema";
import { createAction, updateAction } from "./actions";
import { toast } from "sonner";

interface MyFormProps {
  initialData?: MyRow | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MyForm({ initialData, onSuccess, onCancel }: MyFormProps) {
  const isEditing = !!initialData;

  const form = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  async function onSubmit(values: CreateData) {
    try {
      if (isEditing) {
        await updateAction(initialData!.uuid, values);
        toast.success("Atualizado com sucesso");
      } else {
        await createAction(values);
        toast.success("Criado com sucesso");
      }
      onSuccess();
    } catch (err) {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
            {form.formState.isSubmitting ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## AlertDialog de Confirmação (Delete)

```tsx
<AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza? Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={async () => {
          await deleteAction(deletingItem!.uuid);
          toast.success("Excluído com sucesso");
          setDeletingItem(null);
        }}
      >
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Regras Gerais

- Sempre mostrar loading no botão de submit (`form.formState.isSubmitting`)
- Sempre fechar o Sheet após sucesso (não em erro)
- Sempre `toast.success` em sucesso e `toast.error` em erro
- Campos obrigatórios com `required_error` no Zod
- `FormMessage` em cada `FormField` (mostra erro do Zod)
