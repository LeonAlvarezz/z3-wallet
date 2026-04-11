import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { form, submitAttempts } = useMutateTransactionContext();

  return (
    <form.Field
      name="created_at"
      children={(field) => {
        const createdAt = field.state.value ?? new Date().toISOString();
        const activePreset = getTransactionDatePreset(createdAt);
        const selectedDate = new Date(createdAt);
        const selectedCalendarDate = Number.isNaN(selectedDate.getTime())
          ? new Date()
          : selectedDate;
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
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
                          setIsDatePickerOpen(true);
                          field.handleBlur();
                          return;
                        }

                        setIsCustomDateOpen(false);
                        setIsDatePickerOpen(false);
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
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id={field.name}
                      type="button"
                      variant="outline"
                      className="w-full justify-between px-3 font-normal"
                      onBlur={field.handleBlur}
                    >
                      {formatTransactionDateLabel(createdAt)}
                      <CalendarIcon className="text-muted-foreground size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedCalendarDate}
                      defaultMonth={selectedCalendarDate}
                      disabled={{ after: todayEnd }}
                      onSelect={(date) => {
                        if (!date) return;

                        const safeDateKey = getSafeTransactionDateKey(
                          getLocalDateKey(date),
                        );
                        field.handleChange(
                          getCreatedAtForDateKey(safeDateKey),
                        );
                        field.handleBlur();
                        setIsDatePickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </div>
          </Field>
        );
      }}
    />
  );
}
