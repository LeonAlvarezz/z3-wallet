import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { CategoryModel } from "@z3-wallet/types";
import IconSkeleton from "@/components/icon-skeleton/IconSkeleton";
import { getCategoryVariantColors } from "@/modules/category/constants/category-color-map";

export type ColorVariant =
  | "default"
  | "yellow"
  | "green"
  | "blue"
  | "gray"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "teal";

type CategoryBlockProps = {
  category: CategoryModel.CategoryDto;
  value: string;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
};

export default function CategoryBlock({
  category,
  value,
  className,
  disabled,
  compact = false,
}: CategoryBlockProps) {
  const colors = getCategoryVariantColors(category.color);

  return (
    <ToggleGroupItem
      value={value}
      disabled={disabled}
      aria-label={category.name}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center rounded-sm! border transition-all",
        compact ? "gap-1 p-2" : "gap-2 p-4",
        colors.bg,
        "border-transparent",
        "data-[state=on]:border-primary data-[state=on]:ring-primary data-[state=on]:scale-105 data-[state=on]:ring-1",
        className,
      )}
    >
      <Icon
        icon={category.icon}
        className={cn(compact ? "size-6" : "size-8", colors.text)}
        fallback={<IconSkeleton />}
      />
      <p
        className={cn(
          colors.text,
          compact ? "max-w-full truncate text-xs leading-tight" : "text-sm",
        )}
      >
        {category.name}
      </p>
      {/* <IconSkeleton /> */}
    </ToggleGroupItem>
  );
}
