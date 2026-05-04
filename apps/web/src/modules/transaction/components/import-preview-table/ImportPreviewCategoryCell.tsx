import {
  EditableSelectCell,
  type EditableSelectCellOption,
} from "@/components/ui/editable-cell";
import { cn } from "@/lib/utils";
import { useCategories } from "@/modules/category/hooks/query/use-categories";
import type { CategoryModel } from "@z3-wallet/types";

type Props = {
  category: CategoryModel.CategoryDto | null;
  isInvalid?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  onChange?: (category: CategoryModel.CategoryDto | null) => void;
};

export function ImportPreviewCategoryCell({
  category,
  isInvalid = false,
  errorMessage,
  disabled,
  onChange,
}: Props) {
  const { data: categories = [], isLoading } = useCategories();
  const value = category ? String(category.id) : "";
  const categoryOptions = categories.map((categoryOption) => ({
    value: String(categoryOption.id),
    label: categoryOption.name,
  }));
  const shouldKeepCurrentCategory =
    category !== null &&
    !categoryOptions.some((option) => option.value === value);
  const options: EditableSelectCellOption[] = [
    ...(shouldKeepCurrentCategory ? [{ value, label: category.name }] : []),
    ...categoryOptions,
  ];

  if (isLoading && category === null) {
    options.push({
      value: "__loading_categories__",
      label: "Loading categories...",
      disabled: true,
    });
  }

  return (
    <div className="space-y-1">
      <EditableSelectCell
        value={value}
        ariaLabel="Edit category"
        ariaInvalid={isInvalid}
        disabled={disabled}
        emptyLabel="Select category"
        options={options}
        displayClassName={cn(
          isInvalid &&
            "border border-destructive ring-destructive/20 ring-[3px] dark:ring-destructive/40",
        )}
        triggerClassName="bg-card"
        renderValue={(_, option) => option?.label}
        onValueChange={(nextValue) => {
          if (!onChange) return;

          if (!nextValue) {
            onChange(null);
            return;
          }

          const selectedCategory =
            categories.find(
              (categoryOption) => String(categoryOption.id) === nextValue,
            ) ?? category;

          onChange(selectedCategory);
        }}
      />
      {isInvalid && errorMessage ? (
        <p role="alert" className="text-destructive text-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
