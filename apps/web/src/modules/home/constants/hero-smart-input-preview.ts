import { CategoryModel } from "@z3-wallet/types";

export type DemoScene = {
  input: string;
  category: string;
  categoryColor: CategoryModel.CategoryColorEnum;
  categoryIcon: string;
  payee: string;
  payeeIcon: string;
  price: number;
};

export const DEMO_SCENES: DemoScene[] = [
  {
    input: "5 Starbucks coffee",
    category: "Food & Drinks",
    categoryColor: CategoryModel.CategoryColorEnum.ORANGE,
    categoryIcon: "solar:cup-hot-bold-duotone",
    payee: "Starbucks",
    payeeIcon: "simple-icons:starbucks",
    price: 5,
  },
  {
    input: "245 Airbnb travel",
    category: "Travel",
    categoryColor: CategoryModel.CategoryColorEnum.BLUE,
    categoryIcon: "solar:compass-bold-duotone",
    payee: "Airbnb",
    payeeIcon: "simple-icons:airbnb",
    price: 245,
  },
  {
    input: "18 Uber transport",
    category: "Transportation",
    categoryColor: CategoryModel.CategoryColorEnum.GREEN,
    categoryIcon: "solar:map-arrow-right-bold-duotone",
    payee: "Uber",
    payeeIcon: "simple-icons:uber",
    price: 18,
  },
  {
    input: "62 Target grocery",
    category: "Groceries",
    categoryColor: CategoryModel.CategoryColorEnum.PINK,
    categoryIcon: "solar:cart-4-bold-duotone",
    payee: "Target",
    payeeIcon: "simple-icons:target",
    price: 62,
  },
];
