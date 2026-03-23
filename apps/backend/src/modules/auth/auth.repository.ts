import { db, DrizzleTransaction } from "@/lib/db";
import { authTable } from "@/lib/db/schema";
import { AuthModel } from "@z3-wallet/types";
import { eq } from "drizzle-orm";

export class AuthRepository {
  static async create(
    payload: AuthModel.UpsertAuthDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client.insert(authTable).values(payload).returning();
    return result;
  }

  static async findByUserId(user_id: number) {
    return await db.query.authTable.findFirst({
      where: eq(authTable.user_id, user_id),
    });
  }

  static async changePassword(newPasswordHash: string, user_id: number) {
    return await db
      .update(authTable)
      .set({
        password_hash: newPasswordHash,
      })
      .where(eq(authTable.user_id, user_id));
  }
}
