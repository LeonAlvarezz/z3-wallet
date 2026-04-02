import { db, DrizzleTransaction } from "@/lib/db";
import { categoryTable, walletTable } from "@/lib/db/schema";
import { transactionTable } from "@/lib/db/schema/transaction.schema";
import { decodeCursor } from "@/util/cursor-pagination";
import { getTimeFrameRange } from "@/util/date";
import { BaseModel, TransactionModel } from "@z3-wallet/types";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  or,
  sql,
  SQL,
  sum,
} from "drizzle-orm";

export class TransactionRepository {
  static buildFilter(filter: TransactionModel.TransactionFilterDto) {
    const where: SQL[] = [];
    if (filter.cursor) {
      const { created_at, id } = decodeCursor(filter.cursor);
      // Match orderBy: created_at desc, id desc
      // Next page: (created_at < cursor.created_at) OR (created_at = cursor.created_at AND id < cursor.id)
      const condition = or(
        lt(transactionTable.created_at, created_at),
        and(
          eq(transactionTable.created_at, created_at),
          lt(transactionTable.id, id),
        ),
      );
      if (condition) where.push(condition);
    }

    if (filter.query) {
      where.push(ilike(transactionTable.description, `%${filter.query}%`));
    }

    if (filter.time_frame) {
      const { start, endExclusive } = getTimeFrameRange(filter.time_frame);

      if (start) {
        where.push(gte(transactionTable.created_at, start.toISOString()));
      }
      if (endExclusive) {
        where.push(lt(transactionTable.created_at, endExclusive.toISOString()));
      }
    }

    return where;
  }

  static buildStatisticFilter(filter: TransactionModel.StatisticFilterDto) {
    const where: SQL[] = [];
    if (filter.time_frame) {
      const { start, endExclusive } = getTimeFrameRange(filter.time_frame);
      if (start) {
        where.push(gte(transactionTable.created_at, start.toISOString()));
      }
      if (endExclusive) {
        where.push(lt(transactionTable.created_at, endExclusive.toISOString()));
      }
    }
    return where;
  }

  static async findMany() {
    return await db.query.transactionTable.findMany();
  }

  static async findById(id: number) {
    return await db.query.transactionTable.findFirst({
      where: eq(transactionTable.id, id),
    });
  }

  static async cPaginate(
    query: TransactionModel.TransactionFilterDto,
    user_id: number,
  ) {
    const conditions = this.buildFilter(query);
    const result = await db
      .select()
      .from(transactionTable)
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .leftJoin(
        categoryTable,
        eq(transactionTable.category_id, categoryTable.id),
      )
      .where(and(...conditions, eq(walletTable.user_id, user_id)))
      .limit(query.page_size)
      .orderBy(desc(transactionTable.created_at), desc(transactionTable.id));

    const transaction = result.map((row) => ({
      ...row.transactions,
      category: row.categories,
    }));

    return transaction;
  }

  static async getTransactionsByUserId(userId: number) {
    const result = await db
      .select()
      .from(transactionTable)
      .innerJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(eq(walletTable.user_id, userId));
    return result.map((row) => row.transactions);
  }

  static async findDailyNetTotalsByDates(
    dates: string[],
    user_id: number,
    searchQuery?: string,
  ) {
    const where = this.buildFilter({
      query: searchQuery,
      page_size: 10,
    });

    const conditions: SQL[] = [
      ...where,
      inArray(sql`DATE(${transactionTable.created_at})`, dates),
      eq(walletTable.user_id, user_id),
    ];

    return await db
      .select({
        day: sql<string>`DATE(${transactionTable.created_at})`,
        // Postgres returns SUM(numeric) as string; cast to float to ensure JSON number.
        total: sql<number>`COALESCE(SUM(CASE WHEN type = 'TOP_UP' THEN ${transactionTable.amount} ELSE - ${transactionTable.amount} END), 0)::float8`,
      })
      .from(transactionTable)
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(and(...conditions))
      .groupBy(sql`DATE(${transactionTable.created_at})`)
      .orderBy(sql`DATE(${transactionTable.created_at})`);
  }

  static async findCashflowTotalsByUserId(
    query: TransactionModel.TransactionBaseQuery,
    user_id: number,
  ) {
    const conditions = this.buildFilter({
      ...query,
      page_size: 0,
    });

    const [result] = await db
      .select({
        expense:
          sql<number>`COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN ${transactionTable.amount} ELSE 0 END), 0)`.mapWith(
            Number,
          ),
        top_up:
          sql<number>`COALESCE(SUM(CASE WHEN type = 'TOP_UP' THEN ${transactionTable.amount} ELSE 0 END), 0)`.mapWith(
            Number,
          ),
      })
      .from(transactionTable)
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(and(...conditions, eq(walletTable.user_id, user_id)));

    return result;
  }

  static async getBalanceSummaryByUserId(user_id: number) {
    const [result] = await db
      .select({
        total_remaining_balance:
          sql<number>`COALESCE(SUM(CASE WHEN type = 'TOP_UP' THEN ${transactionTable.amount} ELSE -${transactionTable.amount} END), 0)`.mapWith(
            Number,
          ),
        expense:
          sql<number>`COALESCE(SUM(CASE WHEN type = 'EXPENSE' and date_trunc('month', ${transactionTable.created_at}) = date_trunc('month', CURRENT_TIMESTAMP) THEN ${transactionTable.amount} ELSE 0 END), 0)`.mapWith(
            Number,
          ),
        top_up:
          sql<number>`COALESCE(SUM(CASE WHEN type = 'TOP_UP' and date_trunc('month', ${transactionTable.created_at}) = date_trunc('month', CURRENT_TIMESTAMP) THEN ${transactionTable.amount} ELSE 0 END), 0)`.mapWith(
            Number,
          ),
      })
      .from(transactionTable)
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(eq(walletTable.user_id, user_id));
    return result;
  }

  // Statistic
  static async findStatistic(
    query: TransactionModel.StatisticFilterDto,
    user_id: number,
  ) {
    const where = this.buildStatisticFilter(query);
    const bucket =
      query.time_frame === BaseModel.TimeFrameEnum.TODAY ||
      query.time_frame === BaseModel.TimeFrameEnum.YESTERDAY
        ? sql`date_trunc('hour', ${transactionTable.created_at})`
        : query.time_frame === BaseModel.TimeFrameEnum.YEAR ||
            query.time_frame === BaseModel.TimeFrameEnum.ALL_TIME
          ? sql`date_trunc('month', ${transactionTable.created_at})`
          : sql`date_trunc('day', ${transactionTable.created_at})`;

    const conditions: SQL[] = [
      ...where,
      eq(walletTable.user_id, user_id),
      eq(transactionTable.type, TransactionModel.TransactionTypeEnum.EXPENSE),
    ];

    return db
      .select({
        date: sql<string>`to_char(${bucket} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
        amount: sum(transactionTable.amount).mapWith(Number),
      })
      .from(transactionTable)
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(and(...conditions))
      .groupBy(bucket)
      .orderBy(asc(bucket));
  }

  static async getTotalAmountByCategory(
    query: TransactionModel.StatisticFilterDto,
    user_id: number,
  ) {
    const where = this.buildStatisticFilter(query);
    return db
      .select({
        amount: sum(transactionTable.amount).mapWith(Number),
        name: categoryTable.name,
      })
      .from(transactionTable)
      .leftJoin(
        categoryTable,
        eq(categoryTable.id, transactionTable.category_id),
      )
      .leftJoin(walletTable, eq(transactionTable.wallet_id, walletTable.id))
      .where(
        and(
          ...where,
          eq(walletTable.user_id, user_id),
          eq(
            transactionTable.type,
            TransactionModel.TransactionTypeEnum.EXPENSE,
          ),
        ),
      )
      .groupBy(categoryTable.name)
      .orderBy(desc(sum(transactionTable.amount)));
  }

  static async create(
    payload: TransactionModel.CreateTransactionDto,
    wallet_id: number,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(transactionTable)
      .values({
        ...payload,
        wallet_id,
      })
      .returning();
    return result;
  }

  static async update(
    id: number,
    payload: TransactionModel.UpdateTransactionDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(transactionTable)
      .set(payload)
      .where(eq(transactionTable.id, id))
      .returning();
    return result;
  }
  static async delete(id: number, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .delete(transactionTable)
      .where(eq(transactionTable.id, id))
      .returning();
    return result;
  }
}
