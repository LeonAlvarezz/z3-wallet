import { useState } from "react";
import { BaseModel } from "@z3-wallet/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Empty from "@/components/empty/Empty";
import { useCategories } from "@/modules/category/hooks/query/use-categories";
import CategoryAmountCard from "../category-stats/CategoryAmountCard";
import CategoryAmountCardSkeleton from "../category-stats/CategoryAmountCardSkeleton";
import { useGetTotalByCategory } from "../../hooks/use-get-total-by-category";

type DashboardCategorySectionProps = {
  timeFrame: BaseModel.TimeFrameEnum;
};

export default function DashboardCategorySection({
  timeFrame,
}: DashboardCategorySectionProps) {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const { data: categories } = useCategories();
  const {
    data: totalByCategory,
    isFetching: isCategoryFetching,
    isLoading: isCategoryLoading,
  } = useGetTotalByCategory({
    time_frame: timeFrame,
  });
  const categoryTotal =
    totalByCategory?.reduce((sum, category) => sum + category.amount, 0) ?? 0;
  const visibleCategories = isCategoryExpanded
    ? (totalByCategory ?? [])
    : (totalByCategory ?? []).slice(0, 3);

  return (
    <section className="space-y-4">
      <h1 className="font-bold">Top Category</h1>
      {isCategoryLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CategoryAmountCardSkeleton key={index} />
          ))}
        </div>
      ) : !totalByCategory || totalByCategory.length === 0 ? (
        <Empty
          title="No category data"
          description="No spending data for selected timeframe"
        />
      ) : (
        <>
          <div
            className={`space-y-4 transition-opacity duration-300 ${
              isCategoryFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {visibleCategories.map((item) => {
              const category = categories?.find((entry) => entry.name === item.name);
              return (
                <CategoryAmountCard
                  key={item.name}
                  item={item}
                  total={categoryTotal}
                  category={category}
                />
              );
            })}
          </div>
          {totalByCategory.length > 3 && (
            <Button
              type="button"
              variant="ghost"
              className="h-fit w-full p-0"
              aria-expanded={isCategoryExpanded}
              onClick={() => setIsCategoryExpanded((prev) => !prev)}
            >
              <Icon
                icon={
                  isCategoryExpanded
                    ? "solar:alt-arrow-up-bold"
                    : "solar:alt-arrow-down-bold"
                }
                className="size-6"
              />
              {isCategoryExpanded ? "Show less" : "See more"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
