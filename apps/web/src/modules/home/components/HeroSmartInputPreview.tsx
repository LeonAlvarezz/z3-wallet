import { Icon } from "@iconify/react";
import { CategoryModel } from "@my-wallet/types";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryVariantColors } from "@/modules/category/constants/category-color-map";
import { AmountDisplay } from "@/components/amount/AmountDisplay";

type DemoScene = {
  input: string;
  category: string;
  categoryColor: CategoryModel.CategoryColorEnum;
  categoryIcon: string;
  merchant: string;
  merchantIcon: string;
  price: number;
};

const DEMO_SCENES: DemoScene[] = [
  {
    input: "5 Starbucks coffee",
    category: "Food & Drinks",
    categoryColor: CategoryModel.CategoryColorEnum.ORANGE,
    categoryIcon: "solar:cup-hot-bold-duotone",
    merchant: "Starbucks",
    merchantIcon: "simple-icons:starbucks",
    price: 5,
  },
  {
    input: "245 Airbnb travel",
    category: "Travel",
    categoryColor: CategoryModel.CategoryColorEnum.BLUE,
    categoryIcon: "solar:compass-bold-duotone",
    merchant: "Airbnb",
    merchantIcon: "simple-icons:airbnb",
    price: 245,
  },
  {
    input: "18 Uber Transport",
    category: "Transport",
    categoryColor: CategoryModel.CategoryColorEnum.GREEN,
    categoryIcon: "solar:map-arrow-right-bold-duotone",
    merchant: "Uber",
    merchantIcon: "simple-icons:uber",
    price: 18,
  },
  {
    input: "62 Target grocery",
    category: "Groceries",
    categoryColor: CategoryModel.CategoryColorEnum.PINK,
    categoryIcon: "solar:cart-4-bold-duotone",
    merchant: "Target",
    merchantIcon: "simple-icons:target",
    price: 62,
  },
];

type StageItemProps = {
  eyebrow: string;
  title: string;
  side: "left" | "right";
  delayMs: number;
  children: ReactNode;
};

function StageItem({
  eyebrow,
  title,
  side,
  delayMs,
  children,
}: StageItemProps) {
  return (
    <div
      className={cn(
        "smart-stage-cluster pointer-events-none absolute flex flex-col gap-3",
        side === "left"
          ? "top-10 left-0 max-w-44 items-start sm:top-12 sm:left-5"
          : "top-16 right-0 max-w-48 items-end text-right sm:top-20 sm:right-5",
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="px-1">
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
          {eyebrow}
        </p>
        <p className="mt-1 text-lg font-medium tracking-[-0.02em] text-zinc-300 sm:text-xl">
          {title}
        </p>
      </div>

      <div
        className={cn(
          "smart-stage-card relative h-28 w-28 sm:h-32 sm:w-32",
          side === "left" ? "is-left" : "is-right",
        )}
        style={{ animationDelay: `${delayMs + 620}ms` }}
      >
        <div className="border-input/20 bg-card/35 absolute inset-0 translate-x-3 translate-y-3 rounded-[1.65rem] border" />
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}

type CategoryStageItemProps = {
  category: string;
  categoryColor: CategoryModel.CategoryColorEnum;
  categoryIcon: string;
  delayMs: number;
};

function CategoryStageItem({
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

function MerchantStageItem({
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

function PriceStageItem({ price, delayMs }: PriceStageItemProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center sm:bottom-38">
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

export function HeroSmartInputPreview() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);

  const activeScene = DEMO_SCENES[activeSceneIndex];
  const inputValue = activeScene.input.slice(0, typedLength);
  const revealCards = typedLength >= activeScene.input.length;

  useEffect(() => {
    console.log("activeScene.input.length:", activeScene.input.length);
    console.log("typedLength:", typedLength);
    if (typedLength < activeScene.input.length) {
      const nextCharacter = activeScene.input[typedLength];
      const timeoutId = window.setTimeout(
        () => setTypedLength((currentLength) => currentLength + 1),
        nextCharacter === " " ? 40 : 85,
      );

      return () => window.clearTimeout(timeoutId);
    }

    // Animation End
    //
    const timeoutId = window.setTimeout(() => {
      setTypedLength(0);
      setActiveSceneIndex((currentIndex) => {
        console.log(
          "(currentIndex + 1) % DEMO_SCENES.length:",
          (currentIndex + 1) % DEMO_SCENES.length,
        );
        return (currentIndex + 1) % DEMO_SCENES.length;
      });
    }, 2800);
    return () => window.clearTimeout(timeoutId);
  }, [activeScene.input, typedLength]);

  return (
    <div className="relative overflow-hidden rounded-[2.35rem] p-4 sm:p-5">
      <div className="relative min-h-105 sm:min-h-130">
        {revealCards && (
          <PriceStageItem price={activeScene.price} delayMs={60} />
        )}

        {revealCards && (
          <CategoryStageItem
            category={activeScene.category}
            categoryColor={activeScene.categoryColor}
            categoryIcon={activeScene.categoryIcon}
            delayMs={180}
          />
        )}

        {revealCards && (
          <MerchantStageItem
            merchant={activeScene.merchant}
            merchantIcon={activeScene.merchantIcon}
            delayMs={320}
          />
        )}

        <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-8 sm:bottom-8">
          <div className="typewriter border-input/50 bg-card flex h-12 items-center justify-center rounded-lg border px-6 py-4 text-center sm:h-22 sm:px-7">
            <p>{inputValue}</p>+
          </div>
        </div>
      </div>
    </div>
  );
}
