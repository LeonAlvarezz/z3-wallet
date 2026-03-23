import { db, DrizzleTransaction } from "@/lib/db";
import { categoryTable } from "@/lib/db/schema/category.schema";
import { CategoryModel } from "@z3-wallet/types";
import { eq } from "drizzle-orm";

export class CategoryRepository {
  static async findAll() {
    return await db.query.categoryTable.findMany({
      orderBy: categoryTable.order,
    });
  }

  static async checkIfExists(id: number) {
    const row = await db.query.categoryTable.findFirst({
      columns: { id: true },
      where: eq(categoryTable.id, id),
    });

    return !!row;
  }

  static async findById(id: number) {
    return await db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, id),
    });
  }

  static async create(
    payload: CategoryModel.CreateCategoryDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(categoryTable)
      .values(payload)
      .returning();
    return result;
  }

  static async update(
    id: number,
    payload: CategoryModel.UpdateCategoryDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(categoryTable)
      .set(payload)
    .where(eq(categoryTable.id, id))
      .returning();
    return result;
  }

  static async delete(id: number, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .delete(categoryTable)
      .where(eq(categoryTable.id, id))
      .returning();
    return result;
  }
}
