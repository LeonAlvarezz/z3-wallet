import { Progress } from "@/components/ui/progress";
import { Icon } from "@iconify/react";
import { CategoryModel } from "@z3-wallet/types";
import { getCategoryVariantColors } from "@/modules/category/constants/category-color-map";

type Props = {
  category: CategoryModel.CategoryDto;
  progress?: number;
};
export default function CategoryStatsCard({ category, progress = 0 }: Props) {
  const colors = getCategoryVariantColors(category.color);

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <div className={`flex rounded-md p-2 ${colors.bg}`}>
        <Icon icon={category.icon} className={`text-xl ${colors.text}`} />
      </div>
      <div className="w-full space-y-1">
        <p>{category.name}</p>
        <Progress value={progress} />
      </div>
      <p className="text-muted-foreground text-xs">{progress}%</p>
    </div>
  );
}
