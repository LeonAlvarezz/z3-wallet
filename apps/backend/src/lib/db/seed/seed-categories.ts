import logger from "@/lib/logger";
import { CategoryModel } from "@z3-wallet/types";
import { db, type DrizzleTransaction } from "..";
import { categoryTable } from "../schema/category.schema";

type SeedExecutor = typeof db | DrizzleTransaction;

export const baseCategories = [
  {
    name: "Food",
    icon: "solar:donut-bold-duotone",
    color: CategoryModel.CategoryColorEnum.GREEN,
    order: 1,
  },
  {
    name: "Coffee",
    icon: "solar:cup-paper-bold-duotone",
    color: CategoryModel.CategoryColorEnum.YELLOW,
    order: 2,
  },
  {
    name: "Transportation",
    icon: "solar:scooter-bold-duotone",
    color: CategoryModel.CategoryColorEnum.GRAY,
    order: 3,
  },
  {
    name: "Health",
    icon: "solar:health-bold-duotone",
    color: CategoryModel.CategoryColorEnum.RED,
    order: 4,
  },
  {
    name: "Utility",
    icon: "solar:lightbulb-bolt-bold-duotone",
    color: CategoryModel.CategoryColorEnum.ORANGE,
    order: 5,
  },
  {
    name: "Other",
    icon: "solar:menu-dots-bold-duotone",
    color: CategoryModel.CategoryColorEnum.DEFAULT,
    order: 6,
  },
  {
    name: "Travel",
    icon: "solar:bicycling-bold-duotone",
    color: CategoryModel.CategoryColorEnum.BLUE,
    order: 7,
  },
  {
    name: "Entertainment",
    icon: "solar:play-bold-duotone",
    color: CategoryModel.CategoryColorEnum.PURPLE,
    order: 8,
  },
  {
    name: "Shopping",
    icon: "solar:bag-bold-duotone",
    color: CategoryModel.CategoryColorEnum.PINK,
    order: 9,
  },
] as const;

export async function seedBaseCategories(executor: SeedExecutor) {
  const categoryInsert = baseCategories.map(async (category) => {
    await executor
      .insert(categoryTable)
      .values({
        color: category.color,
        icon: category.icon,
        name: category.name,
        order: category.order,
      })
      .onConflictDoNothing({ target: categoryTable.order });
  });

  await Promise.all(categoryInsert);

  logger.info("✅ Categories seeded successfully", {
    count: baseCategories.length,
  });
}
