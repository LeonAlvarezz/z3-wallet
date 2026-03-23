import { CategoryModel } from "@my-wallet/types";

export type DemoScene = {
  input: string;
  category: string;
  categoryColor: CategoryModel.CategoryColorEnum;
  categoryIcon: string;
  merchant: string;
  merchantIcon: string;
  price: number;
};

export const DEMO_SCENES: DemoScene[] = [
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
