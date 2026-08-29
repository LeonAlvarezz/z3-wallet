import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CategoryModel, TransactionModel } from "@z3-wallet/types";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImportPreviewCategoryCell } from "../import-preview-table/ImportPreviewCategoryCell";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
};

type ImportFormat = "aba" | "wing" | "custom";
type ImportStep = "upload" | "review" | "confirm";

const IMPORT_CUTOFF_DAY = "2026-04-10";

const IMPORT_PREVIEW_MOCK_DATA: TransactionModel.TransactionWithCategoryDto[] =
  [
    {
      id: 1,
      wallet_id: 1,
      created_at: "2026-04-10T08:15:00.000Z",
      updated_at: "2026-04-10T08:15:00.000Z",
      amount: 18.5,
      description: "Morning coffee",
      category: {
        id: 3,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-04-01T00:00:00.000Z",
        name: "Coffee",
        color: CategoryModel.CategoryColorEnum.ORANGE,
        order: 1,
        icon: "coffee",
      },
      type: TransactionModel.TransactionTypeEnum.EXPENSE,
    },
    {
      id: 2,
      wallet_id: 1,
      created_at: "2026-04-10T12:30:00.000Z",
      updated_at: "2026-04-10T12:30:00.000Z",
      amount: 42,
      description: "Lunch with team",
      category: {
        id: 5,
        created_at: "2026-01-02T00:00:00.000Z",
        updated_at: "2026-04-01T00:00:00.000Z",
        name: "Dining",
        color: CategoryModel.CategoryColorEnum.YELLOW,
        order: 2,
        icon: "utensils",
      },
      type: TransactionModel.TransactionTypeEnum.EXPENSE,
    },
    {
      id: 3,
      wallet_id: 1,
      created_at: "2026-04-11T09:00:00.000Z",
      updated_at: "2026-04-11T09:00:00.000Z",
      amount: 1200,
      description: "Freelance payout",
      category: null,
      type: TransactionModel.TransactionTypeEnum.TOP_UP,
    },
    {
      id: 4,
      wallet_id: 1,
      created_at: "2026-04-11T18:45:00.000Z",
      updated_at: "2026-04-11T18:45:00.000Z",
      amount: 64.9,
      description: "Groceries",
      category: {
        id: 8,
        created_at: "2026-01-03T00:00:00.000Z",
        updated_at: "2026-04-01T00:00:00.000Z",
        name: "Groceries",
        color: CategoryModel.CategoryColorEnum.GREEN,
        order: 3,
        icon: "shopping-cart",
      },
      type: TransactionModel.TransactionTypeEnum.EXPENSE,
    },
  ];

const CATEGORY_REQUIRED_MESSAGE = "Category is required for expenses.";

const importPreviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function getLocalDay(isoDate: string) {
  return isoDate.slice(0, 10);
}

function isCutoffRow(row: TransactionModel.TransactionWithCategoryDto) {
  return getLocalDay(row.created_at) <= IMPORT_CUTOFF_DAY;
}

function getDefaultSelectedRowIds() {
  return IMPORT_PREVIEW_MOCK_DATA.filter((row) => !isCutoffRow(row)).map(
    (row) => row.id,
  );
}

function formatImportedDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return importPreviewDateFormatter.format(date);
}

function formatAmount(row: TransactionModel.TransactionWithCategoryDto) {
  return `${row.type === TransactionModel.TransactionTypeEnum.EXPENSE ? "-" : "+"}$${row.amount.toFixed(2)}`;
}

export default function ImportModal({ open, onOpenChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<ImportStep>("upload");
  const [format, setFormat] = useState<ImportFormat>("aba");
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>(
    getDefaultSelectedRowIds,
  );
  const [importPreviewRows, setImportPreviewRows] = useState<
    TransactionModel.TransactionWithCategoryDto[]
  >(IMPORT_PREVIEW_MOCK_DATA);

  const selectedRows = useMemo(
    () => importPreviewRows.filter((row) => selectedRowIds.includes(row.id)),
    [importPreviewRows, selectedRowIds],
  );
  const cutoffCount = importPreviewRows.filter(isCutoffRow).length;
  const reselectedCutoffCount = selectedRows.filter(isCutoffRow).length;
  const selectedMissingCategoryCount = selectedRows.filter(
    (row) =>
      row.type === TransactionModel.TransactionTypeEnum.EXPENSE &&
      row.category === null,
  ).length;

  const updateImportPreviewRow = (
    rowId: number,
    patch: Partial<TransactionModel.TransactionWithCategoryDto>,
  ) => {
    setImportPreviewRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  const toggleRow = (rowId: number, checked: boolean) => {
    setSelectedRowIds((current) =>
      checked
        ? Array.from(new Set([...current, rowId]))
        : current.filter((id) => id !== rowId),
    );
  };

  const getCategoryError = (
    row: TransactionModel.TransactionWithCategoryDto,
  ) => {
    if (!selectedRowIds.includes(row.id)) return undefined;

    if (
      row.type === TransactionModel.TransactionTypeEnum.EXPENSE &&
      row.category === null
    ) {
      return CATEGORY_REQUIRED_MESSAGE;
    }

    return undefined;
  };

  function handleFileChange(nextFiles: File[]) {
    setFiles(nextFiles);
    setSelectedRowIds(getDefaultSelectedRowIds());
    setStep(nextFiles.length > 0 ? "review" : "upload");
  }

  function handleSubmit() {
    if (selectedRows.length === 0 || selectedMissingCategoryCount > 0) return;

    toast.success(`Imported ${selectedRows.length} transactions`);
    setStep("confirm");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-mobile sm:max-w-mobile grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0">
        <div className="border-b px-4 pt-5 pb-3">
          <DialogTitle className="pr-8 text-base leading-tight">
            Import Transactions
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            Upload a CSV, review the parsed rows, then confirm the selected
            transactions together.
          </DialogDescription>
        </div>

        <div className="min-h-0 space-y-3 overflow-y-auto px-4 py-3">
          <section className="space-y-3 rounded-md border p-3">
            <div className="flex items-start gap-2">
              <Upload className="text-muted-foreground mt-0.5 size-4" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Upload CSV</p>
                <p className="text-muted-foreground text-xs">
                  Raw bank files are only used for this import session.
                </p>
              </div>
            </div>

            <FileUpload
              maxFiles={1}
              maxSize={5 * 1024 * 1024}
              value={files}
              onValueChange={handleFileChange}
              onFileReject={(file: File, message: string) => {
                toast(message, {
                  description: `"${
                    file.name.length > 20
                      ? `${file.name.slice(0, 20)}...`
                      : file.name
                  }" has been rejected`,
                });
              }}
            >
              {files.length <= 0 && (
                <FileUploadDropzone className="min-h-28">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2">
                      <Upload className="text-muted-foreground size-5" />
                    </div>
                    <p className="text-sm font-medium">Drag & drop CSV here</p>
                    <p className="text-muted-foreground text-xs">
                      Or click to browse, up to 5MB
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      Browse file
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
              )}
              <FileUploadList>
                {files.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </section>

          {files.length > 0 && (
            <>
              <section className="space-y-3 rounded-md border p-3">
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="text-muted-foreground mt-0.5 size-4" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">Format Detection</p>
                    <p className="text-muted-foreground text-xs">
                      Suggested ABA CSV from the uploaded file. Switching will
                      reparse the original CSV.
                    </p>
                  </div>
                </div>
                <Select
                  value={format}
                  onValueChange={(value) => {
                    setFormat(value as ImportFormat);
                    setStep("review");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aba">ABA CSV</SelectItem>
                    <SelectItem value="wing">Wing CSV</SelectItem>
                    <SelectItem value="custom">Custom local format</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Review</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      setSelectedRowIds(importPreviewRows.map((row) => row.id));
                    }}
                  >
                    Select all
                  </Button>
                </div>

                <div className="space-y-2">
                  {importPreviewRows.map((row) => {
                    const selected = selectedRowIds.includes(row.id);
                    const categoryError = getCategoryError(row);
                    const cutoffDeselected = isCutoffRow(row);

                    return (
                      <article
                        key={row.id}
                        className={cn(
                          "rounded-md border p-3",
                          selected && "border-primary/60 bg-primary/5",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selected}
                            className="mt-1"
                            onCheckedChange={(checked) =>
                              toggleRow(row.id, Boolean(checked))
                            }
                            aria-label={`Select row ${row.id}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {row.description || "No note"}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {formatImportedDate(row.created_at)}
                                </p>
                              </div>
                              <p
                                className={cn(
                                  "shrink-0 text-sm font-semibold",
                                  row.type ===
                                    TransactionModel.TransactionTypeEnum.EXPENSE
                                    ? "text-rose-500"
                                    : "text-emerald-500",
                                )}
                              >
                                {formatAmount(row)}
                              </p>
                            </div>

                            <div className="mt-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                                  cutoffDeselected
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                                )}
                              >
                                <CheckCircle2 className="size-3.5" />
                                {cutoffDeselected
                                  ? "On or before cutoff"
                                  : "Ready"}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_9rem]">
                              <Select
                                value={row.type}
                                onValueChange={(value) => {
                                  const type =
                                    value as TransactionModel.TransactionTypeEnum;

                                  updateImportPreviewRow(row.id, {
                                    type,
                                    ...(type ===
                                    TransactionModel.TransactionTypeEnum.TOP_UP
                                      ? { category: null }
                                      : {}),
                                  });
                                }}
                              >
                                <SelectTrigger className="bg-card w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value={
                                      TransactionModel.TransactionTypeEnum
                                        .EXPENSE
                                    }
                                  >
                                    Expense
                                  </SelectItem>
                                  <SelectItem
                                    value={
                                      TransactionModel.TransactionTypeEnum
                                        .TOP_UP
                                    }
                                  >
                                    Top Up
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={row.description ?? ""}
                                placeholder="Note"
                                onChange={(event) =>
                                  updateImportPreviewRow(row.id, {
                                    description: event.target.value,
                                  })
                                }
                                aria-label={`Edit note for row ${row.id}`}
                              />
                              <ImportPreviewCategoryCell
                                category={row.category}
                                isInvalid={Boolean(categoryError)}
                                disabled={
                                  row.type ===
                                  TransactionModel.TransactionTypeEnum.TOP_UP
                                }
                                errorMessage={categoryError}
                                onChange={(category) => {
                                  updateImportPreviewRow(row.id, { category });
                                }}
                              />
                            </div>

                            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <Lock className="size-3" />
                                Amount locked
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Lock className="size-3" />
                                Date locked
                              </span>
                              {categoryError ? (
                                <span className="text-destructive inline-flex items-center gap-1">
                                  <AlertTriangle className="size-3" />
                                  {categoryError}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {step === "confirm" && (
                <section className="border-primary/50 bg-primary/5 rounded-md border p-3">
                  <p className="text-sm font-medium">
                    Atomic Confirmation Result
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Imported {selectedRows.length} selected rows together. No
                    raw CSV was stored.
                  </p>
                  <div className="mt-3 space-y-1 text-xs">
                    {selectedRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="truncate">
                          {getLocalDay(row.created_at)} -{" "}
                          {row.description || "No note"}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatAmount(row)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <DialogFooter className="bg-background/95 border-t p-3 backdrop-blur">
          <Button
            variant="outline"
            onClick={() => {
              setStep("review");
            }}
            disabled={files.length === 0}
          >
            Review Rows
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              files.length === 0 ||
              selectedRows.length === 0 ||
              selectedMissingCategoryCount > 0
            }
          >
            Confirm {selectedRows.length} Rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
