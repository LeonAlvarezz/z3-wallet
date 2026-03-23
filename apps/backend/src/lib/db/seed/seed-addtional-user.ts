import logger from "@/lib/logger";
import { hashPassword } from "@/util/password";
import { db } from "..";
import { authTable } from "../schema/auth.schema";
import { categoryTable } from "../schema/category.schema";
import { transactionTable } from "../schema/transaction.schema";
import { userTable } from "../schema/user.schema";
import { walletTable } from "../schema/wallet.schema";
import { TransactionModel } from "@z3-wallet/types";

async function seedUserWithTenTransactions() {
  const uniqueId = Date.now();
  const userSeed = {
    username: `Test2`,
    email: `test2@example.com`,
    password: "12345678",
  };

  const isoHoursAgo = (hoursAgo: number) => {
    const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return d.toISOString();
  };

  await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(userTable)
      .values({
        username: userSeed.username,
        email: userSeed.email,
      })
      .returning({
        id: userTable.id,
        username: userTable.username,
        email: userTable.email,
      });

    if (!newUser) {
      throw new Error("Failed to create seed user");
    }

    const passwordHash = await hashPassword(userSeed.password);
    await tx.insert(authTable).values({
      user_id: newUser.id,
      password_hash: passwordHash,
    });

    const [wallet] = await tx
      .insert(walletTable)
      .values({
        user_id: newUser.id,
        name: "Seed Wallet",
      })
      .returning({
        id: walletTable.id,
      });

    if (!wallet) {
      throw new Error("Failed to create wallet for seed user");
    }

    const categories = await tx
      .select({ id: categoryTable.id, name: categoryTable.name })
      .from(categoryTable);

    if (!categories.length) {
      throw new Error(
        "No categories found. Run db:seed first to insert base categories.",
      );
    }

    const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

    const expenseSeeds = [
      {
        categoryName: "Food",
        amount: 12.9,
        description: "Seed expense: breakfast",
      },
      {
        categoryName: "Coffee",
        amount: 4.5,
        description: "Seed expense: latte",
      },
      {
        categoryName: "Transportation",
        amount: 18.3,
        description: "Seed expense: metro pass",
      },
      {
        categoryName: "Health",
        amount: 25.75,
        description: "Seed expense: pharmacy",
      },
      {
        categoryName: "Utility",
        amount: 33.2,
        description: "Seed expense: electricity",
      },
      {
        categoryName: "Travel",
        amount: 45.6,
        description: "Seed expense: train ticket",
      },
      {
        categoryName: "Entertainment",
        amount: 16.4,
        description: "Seed expense: movie",
      },
      {
        categoryName: "Shopping",
        amount: 58.1,
        description: "Seed expense: groceries",
      },
    ];

    const topUpSeeds = [
      { amount: 250, description: "Seed top-up: salary" },
      { amount: 120, description: "Seed top-up: cashback" },
    ];

    const transactions = [
      ...expenseSeeds.map((seed, index) => ({
        wallet_id: wallet.id,
        category_id: categoryIdByName.get(seed.categoryName) ?? null,
        amount: seed.amount,
        type: TransactionModel.TransactionTypeEnum.EXPENSE,
        description: seed.description,
        created_at: isoHoursAgo(index + 1),
      })),
      ...topUpSeeds.map((seed, index) => ({
        wallet_id: wallet.id,
        category_id: null,
        amount: seed.amount,
        type: TransactionModel.TransactionTypeEnum.TOP_UP,
        description: seed.description,
        created_at: isoHoursAgo(expenseSeeds.length + index + 1),
      })),
    ];

    await tx.insert(transactionTable).values(transactions);

    logger.info("✅ Seed user created", {
      username: newUser.username,
      email: newUser.email,
      password: userSeed.password,
    });

    logger.info("✅ Seeded transactions for new user", {
      total: transactions.length,
      expense: expenseSeeds.length,
      top_up: topUpSeeds.length,
    });
  });
}

async function main() {
  try {
    logger.info("🌱 Seeding one user with 10 transactions...");
    await seedUserWithTenTransactions();
    logger.info("✅ Seed completed successfully");
    process.exit(0);
  } catch (err) {
    logger.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error("❌ Unexpected seeding error:", err);
  process.exit(1);
});
