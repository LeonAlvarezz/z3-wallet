import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  formatTransactionDateLabel,
  getCreatedAtForDateKey,
  getLocalDateKey,
  getPresetDateKey,
  getSafeTransactionDateKey,
  getTransactionDatePreset,
  transactionDatePresetOptions,
} from "@/modules/transaction/lib/transaction-date";
import { useMutateTransactionContext } from "./use-mutate-transaction-context";

export default function TransactionDateField() {
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const { form, submitAttempts } = useMutateTransactionContext();

  return (
    <form.Field
      name="created_at"
      children={(field) => {
        const createdAt = field.state.value ?? new Date().toISOString();
        const activePreset = getTransactionDatePreset(createdAt);
        const selectedDateKey = getLocalDateKey(new Date(createdAt));
        const maxDateKey = getLocalDateKey();
        const showCustomDate = isCustomDateOpen || activePreset === "custom";
        const isInvalid =
          (field.state.meta.isTouched || submitAttempts > 0) &&
          !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                <p className="text-muted-foreground text-sm">
                  {formatTransactionDateLabel(createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {transactionDatePresetOptions.map((option) => {
                  const isSelected = option.value === activePreset;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (option.value === "custom") {
                          setIsCustomDateOpen(true);
                          field.handleBlur();
                          return;
                        }

                        setIsCustomDateOpen(false);
                        field.handleChange(
                          getCreatedAtForDateKey(
                            getPresetDateKey(option.value),
                          ),
                        );
                        field.handleBlur();
                      }}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>

              {showCustomDate && (
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={selectedDateKey}
                  max={maxDateKey}
                  className=""
                  onChange={(event) => {
                    const safeDateKey = getSafeTransactionDateKey(
                      event.target.value,
                    );
                    field.handleChange(getCreatedAtForDateKey(safeDateKey));
                  }}
                  onBlur={field.handleBlur}
                />
              )}

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </div>
          </Field>
        );
      }}
    />
  );
}
