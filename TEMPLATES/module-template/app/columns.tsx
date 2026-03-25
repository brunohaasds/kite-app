"use client";

/**
 * Columns — [NomeDoRecurso]
 *
 * Definição de colunas para DataTable. Usar SortableHeader em colunas ordenáveis.
 */

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { SORTING_FN_ALPHANUMERIC } from "@/lib/utils";

// ─── Tipo da linha (adaptar ao tipo retornado pelo repo) ──────────────────

export interface NomeDoRecursoRow {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  status: string;
  created_at: Date | string | null;
}

// ─── Factory de colunas ───────────────────────────────────────────────────

export function getColumns(options: {
  onEdit: (row: NomeDoRecursoRow) => void;
  onDelete: (row: NomeDoRecursoRow) => void;
}): ColumnDef<NomeDoRecursoRow, unknown>[] {
  return [
    {
      id: "name",
      accessorFn: (row) => row.name,
      header: ({ column }) => <SortableHeader column={column} title="Nome" />,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
      sortingFn: SORTING_FN_ALPHANUMERIC,
      meta: { label: "Nome" },
    },
    {
      id: "description",
      accessorFn: (row) => row.description ?? "",
      header: ({ column }) => <SortableHeader column={column} title="Descrição" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm line-clamp-1">
          {row.original.description ?? "—"}
        </span>
      ),
      sortingFn: SORTING_FN_ALPHANUMERIC,
      meta: { label: "Descrição" },
      enableHiding: true,
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => (
        // Substituir por StatusBadge quando o componente estiver criado
        <span>{row.original.status}</span>
      ),
      sortingFn: SORTING_FN_ALPHANUMERIC,
      meta: { label: "Status" },
      enableHiding: true,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => options.onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => options.onDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { label: "Ações" },
    },
  ];
}
