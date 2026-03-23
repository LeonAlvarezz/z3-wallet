import { CategoryModel } from "@z3-wallet/types";

export const categoryVariantColorMap: Record<
  CategoryModel.CategoryColorEnum,
  { base: string; bg: string; text: string }
> = {
  YELLOW: {
    base: "bg-yellow-300",
    bg: "bg-yellow-300/10",
    text: "text-yellow-300",
  },
  GREEN: {
    base: "bg-green-300",
    bg: "bg-green-300/10",
    text: "text-green-300",
  },
  BLUE: { base: "bg-blue-300", bg: "bg-blue-300/10", text: "text-blue-300" },
  GRAY: { base: "bg-gray-300", bg: "bg-gray-300/10", text: "text-gray-300" },
  DEFAULT: {
    base: "bg-neutral-300",
    bg: "bg-neutral-300/10",
    text: "text-neutral-300",
  },
  PURPLE: {
    base: "bg-purple-300",
    bg: "bg-purple-300/10",
    text: "text-purple-300",
  },
  PINK: { base: "bg-pink-300", bg: "bg-pink-300/10", text: "text-pink-300" },
  RED: { base: "bg-red-300", bg: "bg-red-300/10", text: "text-red-300" },
  ORANGE: {
    base: "bg-orange-300",
    bg: "bg-orange-300/10",
    text: "text-orange-300",
  },
  TEAL: { base: "bg-teal-300", bg: "bg-teal-300/10", text: "text-teal-300" },
};

export function getCategoryVariantColors(
  color?: CategoryModel.CategoryColorEnum,
) {
  return categoryVariantColorMap[
    color ?? CategoryModel.CategoryColorEnum.DEFAULT
  ];
}
