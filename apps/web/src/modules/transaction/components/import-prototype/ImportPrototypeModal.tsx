import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TransactionModel } from "@z3-wallet/types";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Lock,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
};

type ImportFormat = "aba" | "wing" | "custom";
type ImportStep = "upload" | "mapping" | "review" | "confirm";
type ImportField = "date" | "note" | "amount" | "direction" | "category";
type Mapping = Partial<Record<ImportField, string>>;

type SampleFile = {
  id: string;
  name: string;
  format: ImportFormat;
  csv: string;
};

type PrototypeRow = {
  id: string;
  sourceLine: number;
  raw: Record<string, string>;
  selected: boolean;
  valid: boolean;
  cutoffDeselected: boolean;
  errors: string[];
  date: string;
  amount: number | null;
  type: TransactionModel.TransactionTypeEnum;
  note: string;
  category: string;
};

const IMPORT_CUTOFF_DAY = "2026-04-10";

const SAMPLE_FILES: SampleFile[] = [
  {
    id: "aba",
    name: "aba-card-april.csv",
    format: "aba",
    csv: `Date,Description,Amount
2026-04-09,Morning coffee,-2.75
2026-04-10,Groceries,-34.90
2026-04-11,Freelance payout,1200.00
bad-date,Unknown shop,-9.10`,
  },
  {
    id: "wing",
    name: "wing-wallet-april.csv",
    format: "wing",
    csv: `Transaction Date,Details,Debit,Credit
2026-04-08,Transfer fee,1.00,
2026-04-10,Phone top up,5.00,
2026-04-12,Salary,,850.00
2026-04-12,Missing amount,,`,
  },
  {
    id: "custom",
    name: "unknown-bank-export.csv",
    format: "custom",
    csv: `posted,memo,value,kind,label
2026/04/10,Cafe Amazon,3.25,out,Coffee
2026/04/11,Client payment,400.00,in,
not-a-date,Broken import,12.00,out,Transport
2026/04/13,Groceries,24.40,out,Groceries`,
  },
];

const FIELD_OPTIONS: Array<{ value: ImportField; label: string }> = [
  { value: "date", label: "Transaction Date" },
  { value: "amount", label: "Amount" },
  { value: "direction", label: "Money Direction" },
  { value: "note", label: "Note" },
  { value: "category", label: "Category" },
];

const CUSTOM_MAPPING: Mapping = {
  date: "posted",
  amount: "value",
  direction: "kind",
  note: "memo",
  category: "label",
};

function parseCsv(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());

    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
}

function detectFormat(csv: string): ImportFormat {
  const [header = ""] = csv.trim().split(/\r?\n/);

  if (header.includes("Debit") && header.includes("Credit")) return "wing";
  if (header.includes("Description") && header.includes("Amount")) return "aba";
  return "custom";
}

function normalizeDate(value: string) {
  const normalized = value.replaceAll("/", "-");
  const date = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  return normalized;
}

function createRow(
  raw: Record<string, string>,
  index: number,
  format: ImportFormat,
  mapping: Mapping,
): PrototypeRow {
  const mapped = {
    date:
      format === "wing"
        ? raw["Transaction Date"]
        : format === "aba"
          ? raw.Date
          : raw[mapping.date ?? ""] || "",
    note:
      format === "wing"
        ? raw.Details
        : format === "aba"
          ? raw.Description
          : raw[mapping.note ?? ""] || "",
    amount:
      format === "wing"
        ? raw.Debit || raw.Credit
        : format === "aba"
          ? raw.Amount
          : raw[mapping.amount ?? ""] || "",
    direction:
      format === "wing"
        ? raw.Credit
          ? "in"
          : "out"
        : format === "aba"
          ? raw.Amount?.startsWith("-")
            ? "out"
            : "in"
          : raw[mapping.direction ?? ""] || "",
    category: format === "custom" ? raw[mapping.category ?? ""] || "" : "",
  };
  const date = normalizeDate(mapped.date);
  const amountNumber = Math.abs(Number(mapped.amount));
  const errors: string[] = [];

  if (!date) errors.push("Bad date");
  if (!mapped.amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
    errors.push("Bad amount");
  }
  if (!["in", "out"].includes(mapped.direction.toLowerCase())) {
    errors.push("Bad direction");
  }

  const type =
    mapped.direction.toLowerCase() === "in"
      ? TransactionModel.TransactionTypeEnum.TOP_UP
      : TransactionModel.TransactionTypeEnum.EXPENSE;
  const cutoffDeselected = Boolean(date && date <= IMPORT_CUTOFF_DAY);
  const valid = errors.length === 0;

  return {
    id: `row-${index}`,
    sourceLine: index + 2,
    raw,
    selected: valid && !cutoffDeselected,
    valid,
    cutoffDeselected,
    errors,
    date,
    amount: Number.isNaN(amountNumber) ? null : amountNumber,
    type,
    note: mapped.note,
    category:
      type === TransactionModel.TransactionTypeEnum.TOP_UP
        ? ""
        : mapped.category,
  };
}

function parseRows(csv: string, format: ImportFormat, mapping: Mapping) {
  return parseCsv(csv).map((raw, index) =>
    createRow(raw, index, format, mapping),
  );
}

function formatAmount(row: PrototypeRow) {
  if (row.amount === null) return "Invalid";

  return `${row.type === TransactionModel.TransactionTypeEnum.EXPENSE ? "-" : "+"}$${row.amount.toFixed(2)}`;
}

function getHeaders(csv: string) {
  const [header = ""] = csv.trim().split(/\r?\n/);

  return header.split(",").map((value) => value.trim());
}

export default function ImportPrototypeModal({ open, onOpenChange }: Props) {
  const [uploaded, setUploaded] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState(SAMPLE_FILES[0].id);
  const activeSample =
    SAMPLE_FILES.find((sample) => sample.id === activeSampleId) ??
    SAMPLE_FILES[0];
  const [step, setStep] = useState<ImportStep>("upload");
  const [format, setFormat] = useState<ImportFormat>(activeSample.format);
  const [mapping, setMapping] = useState<Mapping>(CUSTOM_MAPPING);
  const [rowEdits, setRowEdits] = useState<
    Record<string, Partial<PrototypeRow>>
  >({});
  const detectedFormat = useMemo(
    () => detectFormat(activeSample.csv),
    [activeSample.csv],
  );
  const rows = useMemo(
    () => parseRows(activeSample.csv, format, mapping),
    [activeSample.csv, format, mapping],
  );
  const reviewRows = rows.map((row) => ({ ...row, ...rowEdits[row.id] }));
  const selectedRows = reviewRows.filter((row) => row.selected && row.valid);
  const invalidCount = reviewRows.filter((row) => !row.valid).length;
  const cutoffCount = reviewRows.filter((row) => row.cutoffDeselected).length;
  const reselectedCutoffCount = selectedRows.filter(
    (row) => row.cutoffDeselected,
  ).length;
  const selectedMissingCategoryCount = selectedRows.filter(
    (row) =>
      row.type === TransactionModel.TransactionTypeEnum.EXPENSE &&
      row.category.trim().length === 0,
  ).length;
  const headers = getHeaders(activeSample.csv);
  const needsMapping = format === "custom";

  const patchRow = (rowId: string, patch: Partial<PrototypeRow>) => {
    setRowEdits((current) => ({
      ...current,
      [rowId]: {
        ...current[rowId],
        ...patch,
      },
    }));
  };

  const chooseSample = (sampleId: string) => {
    const sample =
      SAMPLE_FILES.find((candidate) => candidate.id === sampleId) ??
      SAMPLE_FILES[0];

    setActiveSampleId(sample.id);
    setFormat(detectFormat(sample.csv));
    setRowEdits({});
    setUploaded(false);
    setStep("upload");
  };

  const continueFromUpload = () => {
    setUploaded(true);
    setStep(needsMapping ? "mapping" : "review");
  };

  const confirmImport = () => {
    if (selectedMissingCategoryCount > 0) return;

    toast.success(`Prototype confirmed ${selectedRows.length} rows`);
    setStep("confirm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-mobile sm:max-w-mobile grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0">
        <div className="border-b px-4 pt-5 pb-3">
          <DialogTitle className="pr-8 text-base leading-tight">
            PROTOTYPE - Import Transactions
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            CSV import review for format detection, local field mapping, cutoff
            rows, and atomic confirmation.
          </DialogDescription>
          <div className="mt-3 grid grid-cols-4 gap-1">
            {[
              ["Step", step],
              ["Format", format],
              ["Ready", String(selectedRows.length)],
              ["Issues", String(invalidCount + selectedMissingCategoryCount)],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted rounded-md px-2 py-1.5">
                <p className="text-muted-foreground text-[10px]">{label}</p>
                <p className="truncate text-xs font-medium capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 space-y-3 overflow-y-auto px-4 py-3">
          <section className="space-y-3 rounded-md border p-3">
            <div className="flex items-start gap-2">
              <Upload className="text-muted-foreground mt-0.5 size-4" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Upload CSV</p>
                <p className="text-muted-foreground text-xs">
                  Prototype uses sample CSVs instead of reading local files.
                </p>
              </div>
            </div>

            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Sample file</span>
              <Select value={activeSampleId} onValueChange={chooseSample}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_FILES.map((sample) => (
                    <SelectItem key={sample.id} value={sample.id}>
                      {sample.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <Textarea
              value={activeSample.csv}
              readOnly
              className="max-h-28 min-h-24 font-mono text-xs"
            />

            {!uploaded && (
              <Button className="w-full" onClick={continueFromUpload}>
                Use This CSV
              </Button>
            )}
          </section>

          <section className="space-y-3 rounded-md border p-3">
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="text-muted-foreground mt-0.5 size-4" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Format Detection</p>
                <p className="text-muted-foreground text-xs">
                  Suggested {detectedFormat.toUpperCase()} from headers.
                  Switching reparses the original CSV.
                </p>
              </div>
            </div>
            <Select
              value={format}
              onValueChange={(value) => {
                setFormat(value as ImportFormat);
                setRowEdits({});
                setUploaded(true);
                setStep(value === "custom" ? "mapping" : "review");
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

          {needsMapping && (
            <section className="rounded-md border p-3">
              <div className="flex items-start gap-2">
                <Info className="text-muted-foreground mt-0.5 size-4" />
                <div>
                  <p className="text-sm font-medium">Custom Field Mapping</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Browser-local only. Save the format after a successful
                    manual import.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {FIELD_OPTIONS.map((field) => (
                  <label key={field.value} className="grid gap-1 text-xs">
                    <span className="text-muted-foreground">{field.label}</span>
                    <Select
                      value={mapping[field.value] ?? ""}
                      onValueChange={(value) => {
                        setMapping((current) => ({
                          ...current,
                          [field.value]: value,
                        }));
                        setRowEdits({});
                        setStep("review");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Import Review</p>
                <p className="text-muted-foreground text-xs">
                  Cutoff {IMPORT_CUTOFF_DAY}. Rows on or before that day start
                  deselected.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setRowEdits((current) =>
                    reviewRows.reduce<Record<string, Partial<PrototypeRow>>>(
                      (next, row) => {
                        next[row.id] = {
                          ...current[row.id],
                          selected: row.valid,
                        };
                        return next;
                      },
                      {},
                    ),
                  );
                }}
              >
                Select valid
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Cutoff off", cutoffCount],
                ["Reselected", reselectedCutoffCount],
                ["Invalid", invalidCount],
              ].map(([label, value]) => (
                <div key={label} className="bg-muted rounded-md px-2 py-2">
                  <p className="text-muted-foreground text-[10px]">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {reviewRows.map((row) => (
                <article
                  key={row.id}
                  className={cn(
                    "rounded-md border p-3",
                    row.selected &&
                      row.valid &&
                      "border-primary/60 bg-primary/5",
                    !row.valid && "border-destructive/40 bg-destructive/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={row.selected}
                      disabled={!row.valid}
                      className="mt-1"
                      onCheckedChange={(checked) =>
                        patchRow(row.id, { selected: Boolean(checked) })
                      }
                      aria-label={`Select row ${row.sourceLine}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {row.note || "No note"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Line {row.sourceLine} - {row.date || "Invalid date"}
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
                        {row.valid ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                              row.cutoffDeselected
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                            )}
                          >
                            <CheckCircle2 className="size-3.5" />
                            {row.cutoffDeselected
                              ? "On or before cutoff"
                              : "Ready"}
                          </span>
                        ) : (
                          <span className="text-destructive bg-destructive/10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                            <AlertTriangle className="size-3.5" />
                            {row.errors.join(", ")}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_9rem]">
                        <Select
                          value={row.type}
                          onValueChange={(value) =>
                            patchRow(row.id, {
                              type: value as TransactionModel.TransactionTypeEnum,
                              category:
                                value ===
                                TransactionModel.TransactionTypeEnum.TOP_UP
                                  ? ""
                                  : row.category,
                            })
                          }
                        >
                          <SelectTrigger className="bg-card w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value={
                                TransactionModel.TransactionTypeEnum.EXPENSE
                              }
                            >
                              Expense
                            </SelectItem>
                            <SelectItem
                              value={
                                TransactionModel.TransactionTypeEnum.TOP_UP
                              }
                            >
                              Top Up
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={row.note}
                          placeholder="Note"
                          onChange={(event) =>
                            patchRow(row.id, { note: event.target.value })
                          }
                          aria-label={`Edit note for row ${row.sourceLine}`}
                        />
                        <Input
                          value={row.category}
                          disabled={
                            row.type ===
                            TransactionModel.TransactionTypeEnum.TOP_UP
                          }
                          placeholder={
                            row.type ===
                            TransactionModel.TransactionTypeEnum.TOP_UP
                              ? "Not required"
                              : "Category"
                          }
                          onChange={(event) =>
                            patchRow(row.id, { category: event.target.value })
                          }
                          aria-label={`Edit category for row ${row.sourceLine}`}
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
                        {row.selected &&
                          row.type ===
                            TransactionModel.TransactionTypeEnum.EXPENSE &&
                          row.category.trim().length === 0 && (
                            <span className="text-destructive">
                              Expense needs category before confirm
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {step === "confirm" && (
            <section className="border-primary/50 bg-primary/5 rounded-md border p-3">
              <p className="text-sm font-medium">Atomic Confirmation Result</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Prototype saved {selectedRows.length} selected rows as one
                backend bulk create operation. No raw CSV was stored.
              </p>
              <div className="mt-3 space-y-1 text-xs">
                {selectedRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate">
                      {row.date} - {row.note || "No note"}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatAmount(row)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-md border p-3">
            <p className="text-sm font-medium">Visible Prototype State</p>
            <pre className="bg-muted mt-2 max-h-36 overflow-auto rounded-md p-3 text-xs">
              {JSON.stringify(
                {
                  file: activeSample.name,
                  detectedFormat,
                  selectedFormat: format,
                  step,
                  importCutoffDay: IMPORT_CUTOFF_DAY,
                  cutoffRows: cutoffCount,
                  reselectedCutoffRows: reselectedCutoffCount,
                  selectedRows: selectedRows.map((row) => row.sourceLine),
                  selectedMissingCategoryCount,
                  invalidRows: reviewRows
                    .filter((row) => !row.valid)
                    .map((row) => ({
                      sourceLine: row.sourceLine,
                      errors: row.errors,
                    })),
                },
                null,
                2,
              )}
            </pre>
          </section>
        </div>

        <DialogFooter className="bg-background/95 border-t p-3 backdrop-blur">
          <Button variant="outline" onClick={continueFromUpload}>
            {needsMapping ? "Review Mapping" : "Review Rows"}
          </Button>
          <Button
            onClick={confirmImport}
            disabled={
              selectedRows.length === 0 || selectedMissingCategoryCount > 0
            }
          >
            Confirm {selectedRows.length} Rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
