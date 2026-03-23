import { Progress } from "@/components/ui/progress";
import { Icon } from "@iconify/react";
import { CategoryModel, TransactionModel } from "@z3-wallet/types";
import { getCategoryVariantColors } from "@/modules/category/constants/category-color-map";
import { AmountDisplay } from "@/components/amount/AmountDisplay";

type Props = {
  item: TransactionModel.TotalAmountByCategoryDto;
  total: number;
  category?: CategoryModel.CategoryDto;
};

export default function CategoryAmountCard({ item, total, category }: Props) {
  const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
  const colors = category
    ? getCategoryVariantColors(category.color)
    : getCategoryVariantColors(CategoryModel.CategoryColorEnum.DEFAULT);

  return (
    <div className="flex w-full items-center gap-4">
      <div className={`flex shrink-0 rounded-md p-2 ${colors.bg}`}>
        <Icon
          icon={category?.icon ?? "solar:tag-bold-duotone"}
          className={`text-xl ${colors.text}`}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex justify-between">
          <p className="truncate">{item.name ?? "Uncategorized"}</p>
          <AmountDisplay value={-item.amount} className="text-sm" />
        </div>
        <Progress
          value={percentage}
          indicatorClassName={colors.base}
          className={colors.bg}
        />
      </div>
      <p className="text-muted-foreground text-xs">{percentage}%</p>
    </div>
  );
}
