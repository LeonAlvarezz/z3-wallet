import { db, DrizzleTransaction } from "@/lib/db";
import {
  transactionTable,
  // walletEventTable,
  walletTable,
} from "@/lib/db/schema";
import { WalletModel } from "@z3-wallet/types";
import { eq, inArray, sql } from "drizzle-orm";

export class WalletRepository {
  static async findByUserId(user_id: number) {
    return db.query.walletTable.findFirst({
      where: eq(walletTable.user_id, user_id),
    });
  }

  static async create(
    user_id: number,
    payload: WalletModel.CreateWalletDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(walletTable)
      .values({
        ...payload,
        user_id,
      })
      .returning();
    return result;
  }

  // static async findUserBalance(user_id: number) {
  //   // Subquery for user's wallet ids
  //   const userWallets = db
  //     .$with("user_wallets")
  //     .as(
  //       db
  //         .select({ id: walletTable.id })
  //         .from(walletTable)
  //         .where(eq(walletTable.user_id, user_id)),
  //     );

  //   // Subquery for total balance
  //   const balance = db.$with("balance").as(
  //     db
  //       .select({
  //         totalBalance:
  //           sql<number>`COALESCE(SUM(${walletEventTable.amount}), 0)`.as(
  //             "total_balance",
  //           ),
  //       })
  //       .from(walletEventTable)
  //       .where(
  //         inArray(
  //           walletEventTable.wallet_id,
  //           sql`(select id from ${userWallets})`,
  //         ),
  //       ),
  //   );

  //   // Subquery for total expenses
  //   const expenses = db.$with("expenses").as(
  //     db
  //       .select({
  //         totalExpenses:
  //           sql<number>`COALESCE(SUM(${transactionTable.amount}), 0)`.as(
  //             "total_expenses",
  //           ),
  //       })
  //       .from(transactionTable)
  //       .where(
  //         inArray(
  //           transactionTable.wallet_id,
  //           sql`(select id from ${userWallets})`,
  //         ),
  //       ),
  //   );

  //   // Main query
  //   const result = await db
  //     .with(userWallets, balance, expenses)
  //     .select({
  //       balance: sql<number>`(select total_balance from ${balance})`.mapWith(
  //         Number,
  //       ),
  //       expenses: sql<number>`(select total_expenses from ${expenses})`.mapWith(
  //         Number,
  //       ),
  //       remaining:
  //         sql<number>`(select total_balance from ${balance}) - (select total_expenses from ${expenses})`.mapWith(
  //           Number,
  //         ),
  //     })
  //     .from(sql`(select 1)`); // Dummy from to allow selecting scalars

  //   return result[0];
  // }
}
