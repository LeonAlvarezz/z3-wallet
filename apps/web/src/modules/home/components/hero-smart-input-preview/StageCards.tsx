import { AmountDisplay } from "@/components/amount/AmountDisplay";
import { cn } from "@/lib/utils";
import { getCategoryVariantColors } from "@/modules/category/constants/category-color-map";
import { Icon } from "@iconify/react";
import { CategoryModel } from "@my-wallet/types";
import { StageItem } from "./StageItem";

type CategoryStageItemProps = {
  category: string;
  categoryColor: CategoryModel.CategoryColorEnum;
  categoryIcon: string;
  delayMs: number;
};

export function CategoryStageItem({
  category,
  categoryColor,
  categoryIcon,
  delayMs,
}: CategoryStageItemProps) {
  const colors = getCategoryVariantColors(categoryColor);

  return (
    <StageItem
      eyebrow="Category"
      title={category}
      side="left"
      delayMs={delayMs}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-4",
          colors.bg,
        )}
      >
        <Icon icon={categoryIcon} className={cn("size-8", colors.text)} />
        <p className={cn("text-center text-sm leading-tight", colors.text)}>
          {category}
        </p>
      </div>
    </StageItem>
  );
}

type MerchantStageItemProps = {
  merchant: string;
  merchantIcon: string;
  delayMs: number;
};

export function MerchantStageItem({
  merchant,
  merchantIcon,
  delayMs,
}: MerchantStageItemProps) {
  return (
    <StageItem
      eyebrow="Merchant"
      title={merchant}
      side="right"
      delayMs={delayMs}
    >
      <div className="bg-card border-input/50 text-card-foreground flex h-full w-full flex-col items-center justify-center gap-3 rounded-[1.35rem] border p-4 shadow-xs">
        <Icon icon={merchantIcon} className="text-foreground size-10" />
      </div>
    </StageItem>
  );
}

type PriceStageItemProps = {
  price: number;
  delayMs: number;
};

export function PriceStageItem({ price, delayMs }: PriceStageItemProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center sm:bottom-38">
      <div
        className="smart-stage-cluster flex flex-col items-center gap-3 text-center"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
          Amount
        </p>
        <div
          className="bg-card border-input/50 text-card-foreground animate-card-float min-w-32 rounded-[1.15rem] border px-4 py-3 shadow-xs"
          style={{ animationDelay: `${delayMs + 620}ms` }}
        >
          <AmountDisplay
            showSign={false}
            value={price}
            colorize={false}
            className="text-primary text-3xl font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
