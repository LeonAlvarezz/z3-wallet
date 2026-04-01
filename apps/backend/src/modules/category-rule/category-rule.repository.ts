import { db } from "@/lib/db";
import { categoryRuleTable, categoryTable } from "@/lib/db/schema";
import { CategoryRuleModel } from "@z3-wallet/types";
import { and, count, eq, sql } from "drizzle-orm";

export class CategoryRuleRepository {
  static findMany() {
    return db.query.categoryRuleTable.findMany();
  }

  static findByCategoryId(category_id: number, user_id: number) {
    return db.query.categoryRuleTable.findMany({
      where: and(
        eq(categoryRuleTable.category_id, category_id),
        eq(categoryRuleTable.user_id, user_id),
      ),
    });
  }

  static async checkIfExists(id: number, user_id: number) {
    const row = await db.query.categoryRuleTable.findFirst({
      columns: { id: true },
      where: and(
        eq(categoryRuleTable.id, id),
        eq(categoryRuleTable.user_id, user_id),
      ),
    });

    return !!row;
  }

  static findById(id: number, user_id?: number) {
    return db.query.categoryRuleTable.findFirst({
      where: user_id
        ? and(
            eq(categoryRuleTable.id, id),
            eq(categoryRuleTable.user_id, user_id),
          )
        : eq(categoryRuleTable.id, id),
    });
  }

  static countByCategory(user_id: number) {
    return db
      .select({
        category: categoryTable,
        total: count(categoryRuleTable.category_id).mapWith(Number),
      })
      .from(categoryRuleTable)
      .rightJoin(
        categoryTable,
        and(
          eq(categoryRuleTable.category_id, categoryTable.id),
          eq(categoryRuleTable.user_id, user_id),
        ),
      )
      .orderBy(categoryTable.id)
      .groupBy(categoryTable.id);
  }

  static quickFindAllRules(user_id: number) {
    return db
      .select({
        id: categoryTable.id,
        name: categoryTable.name,
        keywords: sql<string[]>`array_agg(${categoryRuleTable.keyword})`,
      })
      .from(categoryRuleTable)
      .leftJoin(
        categoryTable,
        and(eq(categoryRuleTable.category_id, categoryTable.id)),
      )
      .where(eq(categoryRuleTable.user_id, user_id))
      .groupBy(categoryTable.id);
  }

  static async create(
    payload: CategoryRuleModel.CreateCategoryRuleDto,
    user_id: number,
  ) {
    const [result] = await db
      .insert(categoryRuleTable)
      .values({
        ...payload,
        user_id,
      })
      .returning();
    return result;
  }

  static async update(
    id: number,
    user_id: number,
    payload: CategoryRuleModel.UpdateCategoryRuleDto,
  ) {
    const [result] = await db
      .update(categoryRuleTable)
      .set(payload)
      .where(
        and(
          eq(categoryRuleTable.id, id),
          eq(categoryRuleTable.user_id, user_id),
        ),
      )
      .returning();
    return result;
  }
  static async delete(id: number, user_id: number) {
    const [result] = await db
      .delete(categoryRuleTable)
      .where(
        and(
          eq(categoryRuleTable.id, id),
          eq(categoryRuleTable.user_id, user_id),
        ),
      )
      .returning();
    return result;
  }
}
