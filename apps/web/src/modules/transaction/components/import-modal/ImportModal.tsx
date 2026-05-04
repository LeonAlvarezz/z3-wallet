import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryModel, TransactionModel } from "@z3-wallet/types";
import { createImportPreviewColumns } from "../import-preview-table/import-preview.column";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
};

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

export default function ImportModal({ open, onOpenChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [importPreviewRows, setImportPreviewRows] = useState<
    TransactionModel.TransactionWithCategoryDto[]
  >(IMPORT_PREVIEW_MOCK_DATA);

  const updateImportPreviewRow = (
    rowIndex: number,
    patch: Partial<TransactionModel.TransactionWithCategoryDto>,
  ) => {
    setImportPreviewRows((currentRows) =>
      currentRows.map((row, index) =>
        index === rowIndex ? { ...row, ...patch } : row,
      ),
    );
  };

  const getCategoryError = (
    row: TransactionModel.TransactionWithCategoryDto,
  ) => {
    if (!submitAttempted) return undefined;

    if (
      row.type === TransactionModel.TransactionTypeEnum.EXPENSE &&
      row.category === null
    ) {
      return CATEGORY_REQUIRED_MESSAGE;
    }

    return undefined;
  };

  const columns = createImportPreviewColumns({
    onUpdateRow: updateImportPreviewRow,
    getCategoryError,
  });

  function handleSubmit() {
    setSubmitAttempted(true);
    console.log("Hello");
    console.log({ importPreviewRows });
    const hasMissingExpenseCategory = importPreviewRows.some(
      (row) =>
        row.type === TransactionModel.TransactionTypeEnum.EXPENSE &&
        row.category === null,
    );
    console.log("hasMissingExpenseCategory", hasMissingExpenseCategory);

    if (hasMissingExpenseCategory) return;
    toast.success("Add Success");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Import Transaction</DialogTitle>
        <DialogDescription>
          Upload a file to import multiple transactions at once.
        </DialogDescription>
        <FileUpload
          maxFiles={2}
          maxSize={5 * 1024 * 1024}
          value={files}
          onValueChange={setFiles}
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
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="text-muted-foreground size-6" />
                </div>
                <p className="text-sm font-medium">Drag & drop files here</p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (max 2 files, up to 5MB each)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Browse files
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
          {files.length > 0 && (
            <DataTable columns={columns} data={importPreviewRows} />
          )}
        </FileUpload>
        <DialogFooter>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
