import { db } from "..";
import { categoryTable } from "../schema/category.schema";
import { userTable } from "../schema/user.schema";
import { authTable } from "../schema/auth.schema";
import { walletTable } from "../schema/wallet.schema";
import { transactionTable } from "../schema/transaction.schema";
import { hashPassword } from "@/util/password";
import logger from "@/lib/logger";
import { CategoryModel, TransactionModel } from "@z3-wallet/types";
import { eq } from "drizzle-orm";

export async function seedDatabaseDev() {
  const baseCategories = [
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
  ];

  const testUser = {
    username: "Test",
    email: "test@example.com",
    password: "Password123!",
  };

  const transactionCount = 60;

  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomChoice = <T>(arr: T[]) => arr[randomInt(0, arr.length - 1)];

  const isoDaysAgo = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    // add a little time variance
    d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
    return d.toISOString();
  };

  await db.transaction(async (tx) => {
    const categoryInsert = baseCategories.map(async (category) => {
      await tx
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

    // Create or reuse test user
    await tx
      .insert(userTable)
      .values({
        username: testUser.username,
        email: testUser.email,
      })
      .onConflictDoNothing({ target: userTable.email });

    const user = await tx.query.userTable.findFirst({
      where: eq(userTable.email, testUser.email),
      columns: { id: true },
    });

    if (!user) {
      throw new Error("Failed to create/find test user");
    }

    // Hash password and upsert auth record
    const passwordHash = await hashPassword(testUser.password);
    const existingAuth = await tx.query.authTable.findFirst({
      where: eq(authTable.user_id, user.id),
      columns: { id: true },
    });
    if (existingAuth) {
      await tx
        .update(authTable)
        .set({ password_hash: passwordHash })
        .where(eq(authTable.id, existingAuth.id));
    } else {
      await tx.insert(authTable).values({
        user_id: user.id,
        password_hash: passwordHash,
      });
    }

    // Create or update the user's (single) wallet
    await tx.insert(walletTable).values({
      user_id: user.id,
      name: "Main Wallet",
    });

    const wallet = await tx.query.walletTable.findFirst({
      where: eq(walletTable.user_id, user.id),
      columns: { id: true },
    });

    if (!wallet) {
      throw new Error("Failed to create/find wallet for test user");
    }

    const categories = await tx
      .select({ id: categoryTable.id, name: categoryTable.name })
      .from(categoryTable);

    if (!categories.length) {
      throw new Error("No categories found to seed transactions");
    }

    const seededTransactions = Array.from({ length: transactionCount }).map(
      () => {
        const category = randomChoice(categories);
        const type = randomChoice(
          Object.values(TransactionModel.TransactionTypeEnum),
        );
        const amount = Number((Math.random() * 120 + 3).toFixed(2));
        const daysAgo = randomInt(0, 120);

        return {
          user_id: user.id,
          wallet_id: wallet.id,
          category_id:
            type === TransactionModel.TransactionTypeEnum.EXPENSE
              ? category.id
              : null,
          amount,
          type,
          description:
            type === TransactionModel.TransactionTypeEnum.EXPENSE
              ? `Seeded: ${category.name}`
              : "Top-up",
          created_at: isoDaysAgo(daysAgo),
        };
      },
    );

    await tx.insert(transactionTable).values(seededTransactions);

    logger.info("✅ Test user created", {
      username: testUser.username,
      email: testUser.email,
    });

    logger.info("✅ Wallet seeded", {
      walletName: "Main Wallet",
    });

    logger.info("✅ Transactions seeded", {
      count: transactionCount,
    });
  });
}

async function main() {
  try {
    logger.info("🌱 Starting database seeding...");
    await seedDatabaseDev();
    logger.info("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    logger.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    logger.error("❌ Unexpected error during seeding:", err);
    process.exit(1);
  });
}
