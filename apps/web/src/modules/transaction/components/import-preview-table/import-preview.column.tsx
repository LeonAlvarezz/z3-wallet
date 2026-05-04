"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  EditableInputCell,
  EditableSelectCell,
  type EditableSelectCellOption,
} from "@/components/ui/editable-cell";
import type { ColumnDef } from "@tanstack/react-table";
import { TransactionModel } from "@z3-wallet/types";
import { ImportPreviewCategoryCell } from "./ImportPreviewCategoryCell";
import { cn } from "@/lib/utils";

type ImportPreviewRow = TransactionModel.TransactionWithCategoryDto;

type ImportPreviewColumnOptions = {
  onUpdateRow: (rowIndex: number, patch: Partial<ImportPreviewRow>) => void;
  getCategoryError?: (row: ImportPreviewRow) => string | undefined;
};

const TRANSACTION_TYPE_OPTIONS: EditableSelectCellOption[] = [
  {
    value: TransactionModel.TransactionTypeEnum.EXPENSE,
    label: "Expense",
  },
  {
    value: TransactionModel.TransactionTypeEnum.TOP_UP,
    label: "Top Up",
  },
];

export function createImportPreviewColumns({
  onUpdateRow,
  getCategoryError,
}: ImportPreviewColumnOptions): ColumnDef<ImportPreviewRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <EditableInputCell
          value={String(row.original.amount)}
          type="number"
          ariaLabel="Edit amount"
          className={cn(
            "min-w-20",
            row.original.type === TransactionModel.TransactionTypeEnum.EXPENSE
              ? "text-rose-500"
              : "text-emerald-500",
          )}
          onValueChange={(value) => {
            const nextAmount = Number(value);

            if (Number.isNaN(nextAmount)) return;

            onUpdateRow(row.index, { amount: nextAmount });
          }}
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <EditableInputCell
          value={row.original.description ?? ""}
          ariaLabel="Edit description"
          emptyLabel="Add description"
          className="min-w-40"
          onValueChange={(value) => {
            onUpdateRow(row.index, { description: value });
          }}
        />
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => {
        const categoryError = getCategoryError?.(row.original);

        return (
          <ImportPreviewCategoryCell
            category={row.original.category}
            isInvalid={Boolean(categoryError)}
            disabled={
              row.original.type === TransactionModel.TransactionTypeEnum.TOP_UP
            }
            errorMessage={categoryError}
            onChange={(category) => {
              onUpdateRow(row.index, { category });
            }}
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <EditableSelectCell
          value={row.original.type}
          ariaLabel="Edit transaction type"
          placeholder="Select type"
          options={TRANSACTION_TYPE_OPTIONS}
          triggerClassName="bg-card"
          onValueChange={(value) => {
            const type = value as TransactionModel.TransactionTypeEnum;

            onUpdateRow(row.index, {
              type,
              ...(type === TransactionModel.TransactionTypeEnum.TOP_UP
                ? { category: null }
                : {}),
            });
          }}
        />
      ),
    },
  ];
}
