import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AmountInput } from "@/components/amount-input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import CategoryBlock from "@/modules/category/components/category-block/CategoryBlock";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import { useMutateTransactionContext } from "./use-mutate-transaction-context";
import { TransactionModel } from "@z3-wallet/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CategoryBlockSkeleton from "../../../../category/components/category-block/CategoryBlockSkeleton";
import MutateTransactionFormFooter from "./MutateTransactionFormFooter";
import TransactionDateField from "./TransactionDateField";

const transactionTypeOptions = [
  {
    value: TransactionModel.TransactionTypeEnum.EXPENSE,
    title: "Expense",
    icon: "solar:card-send-bold-duotone",
    activeClassName:
      "border-rose-500/30 bg-rose-500/8 shadow-rose-500/10 [&_[data-role=type-icon]]:bg-rose-500 [&_[data-role=type-icon]]:text-white",
  },
  {
    value: TransactionModel.TransactionTypeEnum.TOP_UP,
    title: "Top Up",
    icon: "solar:wallet-money-bold-duotone",
    activeClassName:
      "border-emerald-500/30 bg-emerald-500/8 shadow-emerald-500/10 [&_[data-role=type-icon]]:bg-emerald-500 [&_[data-role=type-icon]]:text-white",
  },
] as const;

type Props = {
  className?: string;
  children?: ReactNode;
  value?: TransactionModel.CreateTransactionDto;
};
function MutateTransactionForm({ className, children }: Props) {
  const {
    form,
    categories,
    isCategoryLoading,
    CATEGORY_PREVIEW_COUNT,
    submitAttempts,
    noteTextareaRef,
    isCategoryExpanded,
    setIsCategoryExpanded,
  } = useMutateTransactionContext();
  const visibleCategories = isCategoryExpanded
    ? categories
    : categories?.slice(0, CATEGORY_PREVIEW_COUNT);

  const footer = React.Children.toArray(children).find(
    (child) =>
      React.isValidElement(child) &&
      child.type === MutateTransactionForm.Footer,
  );
  return (
    <form id="add-transaction-form" className={className}>
      <FieldGroup>
        <form.Field
          name="amount"
          children={(field) => {
            const isInvalid =
              (field.state.meta.isTouched || submitAttempts > 0) &&
              !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex w-full flex-col items-center gap-4">
                  <FieldLabel htmlFor={field.name}>Enter Amount</FieldLabel>
                  <div className="relative left-6 flex h-fit gap-4">
                    <AmountInput
                      value={field.state.value}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                    />
                    <div className="bg-primary h-fit w-fit rounded-sm px-2 py-1">
                      <p className="text-xs">USD</p>
                    </div>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
        <TransactionDateField />
        <form.Field
          name="type"
          children={(field) => {
            const isInvalid =
              (field.state.meta.isTouched || submitAttempts > 0) &&
              !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                <RadioGroup
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    const nextValue =
                      value as TransactionModel.TransactionTypeEnum;

                    field.handleChange(nextValue);

                    if (
                      nextValue === TransactionModel.TransactionTypeEnum.TOP_UP
                    ) {
                      form.setFieldValue("category_id", null);
                    }

                    field.handleBlur();
                  }}
                  // defaultValue={TransactionModel.TransactionTypeEnum.EXPENSE}
                  className="grid grid-cols-2 gap-3"
                >
                  {transactionTypeOptions.map((option) => {
                    const isSelected = field.state.value === option.value;

                    return (
                      <label
                        key={option.value}
                        htmlFor={option.value}
                        className={cn(
                          "border-input bg-secondary hover:bg-accent/60 flex cursor-pointer items-start gap-3 rounded-xl border p-2 text-left transition-all",
                          "has-data-[state=checked]:shadow-md",
                          isSelected && option.activeClassName,
                          isInvalid && "border-destructive/60",
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          indicator={false}
                        />

                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            data-role="type-icon"
                            className="bg-background text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors"
                          >
                            <Icon icon={option.icon} className="size-5" />
                          </div>

                          <p className="text-sm font-semibold">
                            {option.title}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="type"
          children={(typeField) => {
            if (
              typeField.state.value ===
              TransactionModel.TransactionTypeEnum.TOP_UP
            ) {
              return null;
            }

            return (
              <form.Field
                name="category_id"
                children={(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched || submitAttempts > 0) &&
                    !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex flex-col gap-4">
                        <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                        {isCategoryLoading ? (
                          <CategoryBlockSkeleton />
                        ) : (
                          <>
                            <div className="flex h-fit gap-4">
                              <ToggleGroup
                                type="single"
                                value={field.state.value?.toString()}
                                onValueChange={(value) => {
                                  if (!value) return;
                                  field.handleChange(Number(value));
                                  field.handleBlur();
                                }}
                                className="grid w-full grid-cols-3 gap-2"
                              >
                                {visibleCategories.map((category) => (
                                  <CategoryBlock
                                    key={category.id}
                                    category={category}
                                    value={category.id.toString()}
                                    compact
                                    className={cn(
                                      isInvalid && "border border-red-500",
                                    )}
                                  />
                                ))}
                              </ToggleGroup>
                            </div>
                            {categories.length > CATEGORY_PREVIEW_COUNT && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-fit p-0"
                                aria-expanded={isCategoryExpanded}
                                onClick={() =>
                                  setIsCategoryExpanded((prev) => !prev)
                                }
                              >
                                <Icon
                                  icon={
                                    isCategoryExpanded
                                      ? "solar:alt-arrow-up-bold"
                                      : "solar:alt-arrow-down-bold"
                                  }
                                  className="size-6"
                                />
                                {isCategoryExpanded
                                  ? "Show less"
                                  : "Expand more"}
                              </Button>
                            )}
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </>
                        )}
                      </div>
                    </Field>
                  );
                }}
              />
            );
          }}
        />
        <form.Field
          name="description"
          children={(field) => {
            const isInvalid =
              (field.state.meta.isTouched || submitAttempts > 0) &&
              !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-4">
                  <FieldLabel htmlFor={field.name}>Note</FieldLabel>
                  <Textarea
                    ref={noteTextareaRef}
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Tube Coffee, Aeon Shopping..."
                    className="min-h-20"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
      </FieldGroup>
      {footer}
    </form>
  );
}
MutateTransactionForm.Footer = MutateTransactionFormFooter;
export default MutateTransactionForm;
