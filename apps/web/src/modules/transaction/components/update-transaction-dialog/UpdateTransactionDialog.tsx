import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionModel } from "@z3-wallet/types";
import { Icon } from "@iconify/react";
import { useDeleteTransaction } from "../../hooks/use-delete-transaction";
import DeleteButton from "@/components/delete-button/DeleteButton";
import MutateTransactionContext, {
  useMutateTransactionForm,
} from "../forms/mutate-transaction-form/use-mutate-transaction-context";
import MutateTransactionForm from "../forms/mutate-transaction-form/MutateTransactionForm";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  transaction?: TransactionModel.TransactionWithCategoryDto | null;
  onClose: () => void;
};

export default function UpdateTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onClose,
}: Props) {
  const defaultValue = {
    amount: transaction?.amount ?? 0,
    category_id: transaction?.category?.id ?? 0,
    description: transaction?.description ?? "",
    type: transaction?.type ?? TransactionModel.TransactionTypeEnum.EXPENSE,
    created_at: transaction?.created_at ?? new Date().toISOString(),
  };
  const formHook = useMutateTransactionForm({
    defaultValue,
    action: "update",
    transactionId: transaction?.id ?? 0,
    afterSubmit: () => {
      onOpenChange(false);
      onClose();
    },
  });
  const { form, loading } = formHook;
  const deleteMutation = useDeleteTransaction();

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction</DialogTitle>
          <DialogDescription>
            View, update, or delete transaction
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-4 max-h-[60vh] overflow-y-auto px-4">
          <MutateTransactionContext.Provider value={{ ...formHook }}>
            <MutateTransactionForm className="py-4" value={defaultValue} />
          </MutateTransactionContext.Provider>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-2">
            <DeleteButton
              title="Delete transaction?"
              description="This action cannot be undone. This will permanently delete this transaction."
              confirmText="Delete"
              onConfirm={async () => {
                if (!transaction) return;
                await deleteMutation.mutateAsync(transaction.id);
                handleOpenChange(false);
              }}
              className="text-red-500"
            />
            <Button
              type="button"
              onClick={form.handleSubmit}
              disabled={loading}
              loading={loading}
            >
              <Icon icon="solar:diskette-bold-duotone" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
