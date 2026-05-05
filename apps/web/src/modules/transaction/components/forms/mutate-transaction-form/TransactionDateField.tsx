import { useState } from "react";
import { Button } from "@/components/ui/button";
import DateTimePicker from "@/components/ui/date-time-picker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  formatTransactionDateLabel,
  getCreatedAtForDateKey,
  getPresetDateKey,
  getTransactionDatePreset,
  transactionDatePresetOptions,
} from "@/modules/transaction/lib/transaction-date";
import { useMutateTransactionContext } from "./use-mutate-transaction-context";

export default function TransactionDateField() {
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const { form, submitAttempts } = useMutateTransactionContext();

  return (
    <form.Field
      name="created_at"
      children={(field) => {
        const createdAt = field.state.value ?? new Date().toISOString();
        const activePreset = getTransactionDatePreset(createdAt);
        const selectedDate = new Date(createdAt);
        const selectedDateTime = Number.isNaN(selectedDate.getTime())
          ? new Date()
          : selectedDate;
        const now = new Date();
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 0, 0);
        const showCustomDate = isCustomDateOpen || activePreset === "custom";
        const isInvalid =
          (field.state.meta.isTouched || submitAttempts > 0) &&
          !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={field.name}>Datetime</FieldLabel>
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
                          setIsDateTimePickerOpen(true);
                          field.handleBlur();
                          return;
                        }

                        setIsCustomDateOpen(false);
                        setIsDateTimePickerOpen(false);
                        field.handleChange(
                          getCreatedAtForDateKey(
                            getPresetDateKey(option.value),
                            now,
                            { timeSource: selectedDateTime },
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
                <DateTimePicker
                  id={field.name}
                  value={selectedDateTime}
                  open={isDateTimePickerOpen}
                  onOpenChange={setIsDateTimePickerOpen}
                  disabledDates={{ after: todayEnd }}
                  maxDate={now}
                  onBlur={field.handleBlur}
                  onChange={(date) => {
                    if (!date) return;

                    field.handleChange(date.toISOString());
                    field.handleBlur();
                  }}
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
