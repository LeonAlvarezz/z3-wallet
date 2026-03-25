import SmartInput from "@/components/smart-input/SmartInput";
import { useShortcut } from "@/hooks/use-shortcut";
import MutateTransactionForm from "../components/forms/mutate-transaction-form/MutateTransactionForm";
import MutateTransactionFormFooter from "../components/forms/mutate-transaction-form/MutateTransactionFormFooter";
import MutateTransactionContext, {
  useMutateTransactionForm,
} from "../components/forms/mutate-transaction-form/use-mutate-transaction-context";
import { Button } from "@/components/ui/button";
import { useRef, type CSSProperties } from "react";
import { useAutoPair } from "@/modules/category-rule/hooks/use-auto-pair";
import { useCreateCategoryRule } from "@/modules/category-rule/hooks/use-create-category-rule";
import { toast } from "sonner";

export default function AddTransactionPage() {
  const { logPair, deletePair, potentialPair, ignorePair } = useAutoPair();
  const formHook = useMutateTransactionForm({
    action: "create",
    afterSubmit: (value) => {
      if (!value.description || !value.category_id) {
        return;
      }

      logPair({
        category_id: value.category_id,
        phrase: value.description,
      });
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    smartText,
    setSmartText,
    setSmartAppliedOnce,
    setSubmitAttempts,
    form,
    loading,
    handleSmartSubmit,
  } = formHook;
  useShortcut(
    "cmd+/",
    () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    {
      preventDefault: true,
    },
  );

  const addMutation = useCreateCategoryRule();
  const handleAddRule = async () => {
    if (!potentialPair) {
      toast.error("No potential rule provided");
      return;
    }

    await addMutation.mutateAsync({
      category_id: potentialPair.category_id,
      keyword: potentialPair.phrase,
    });

    deletePair({
      category_id: potentialPair.category_id,
      phrase: potentialPair.phrase,
    });

    toast.success("Successfully added rule");
  };

  const handleIgnorePair = async () => {
    if (!potentialPair) {
      toast.error("No potential rule provided");
      return;
    }
    ignorePair({
      category_id: potentialPair.category_id,
      phrase: potentialPair.phrase,
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto p-4 py-[calc(var(--bottom-nav-h))]">
      <MutateTransactionContext.Provider value={{ ...formHook }}>
        <MutateTransactionForm>
          <MutateTransactionFormFooter>
            <div className="max-w-mobile to-background fixed inset-x-0 bottom-0 m-auto space-y-2 bg-linear-180 px-4 pt-10">
              {potentialPair && (
                <div
                  className="animate-slide-up flex items-center justify-between rounded-md border px-4 py-2"
                  style={
                    {
                      "--slide-from": "20px",
                      animationDuration: "300ms",
                    } as CSSProperties
                  }
                >
                  <p className="text-sm">Save this rule</p>
                  <div className="space-x-2">
                    <Button type="button" size="xs" onClick={handleAddRule}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={handleIgnorePair}
                    >
                      Not now
                    </Button>
                  </div>
                </div>
              )}
              <div className="mb-[calc(var(--bottom-nav-total-h)+10px)] flex gap-2">
                <SmartInput
                  ref={inputRef}
                  value={smartText}
                  onChange={(value) => {
                    setSmartText(value);
                    setSmartAppliedOnce(false);
                  }}
                  onSubmit={handleSmartSubmit}
                />
                <Button
                  type="button"
                  onClick={() => {
                    setSubmitAttempts((n) => n + 1);
                    form.handleSubmit();
                  }}
                  disabled={loading}
                  loading={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          </MutateTransactionFormFooter>
        </MutateTransactionForm>
      </MutateTransactionContext.Provider>
    </div>
  );
}
