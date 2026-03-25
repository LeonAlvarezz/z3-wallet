import SmartInput from "@/components/smart-input/SmartInput";
import { useShortcut } from "@/hooks/use-shortcut";
import MutateTransactionForm from "../components/forms/mutate-transaction-form/MutateTransactionForm";
import MutateTransactionFormFooter from "../components/forms/mutate-transaction-form/MutateTransactionFormFooter";
import MutateTransactionContext, {
  useMutateTransactionForm,
} from "../components/forms/mutate-transaction-form/use-mutate-transaction-context";
import { Button } from "@/components/ui/button";
import { useRef, useState, type CSSProperties } from "react";

export default function AddTransactionPage() {
  const formHook = useMutateTransactionForm({ action: "create" });
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

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto p-4 py-[calc(var(--bottom-nav-h))]">
      <MutateTransactionContext.Provider value={{ ...formHook }}>
        <MutateTransactionForm>
          <MutateTransactionFormFooter>
            <div className="max-w-mobile to-background fixed inset-x-0 bottom-0 m-auto space-y-2 bg-linear-180 px-4 pt-10">
              {smartText.length > 10 && (
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
                    <Button type="button" size="xs">
                      Save
                    </Button>
                    <Button type="button" size="xs" variant="outline">
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
              <Button
                type="button"
                onClick={() => setReveal((prev) => !prev)}
                className="fixed right-0 bottom-0"
              >
                Show
              </Button>
            </div>
          </MutateTransactionFormFooter>
        </MutateTransactionForm>
      </MutateTransactionContext.Provider>
    </div>
  );
}
