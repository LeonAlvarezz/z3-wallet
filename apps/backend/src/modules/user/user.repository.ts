import { eq } from "drizzle-orm";
import { type DrizzleTransaction, db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { UserModel } from "@z3-wallet/types";

export class UserRepository {
  static async create(
    payload: UserModel.UpsertUserDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client.insert(userTable).values(payload).returning();
    return result;
  }

  static async findByEmail(email: string) {
    return await db.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });
  }

  static async findByUsername(username: string) {
    return await db.query.userTable.findFirst({
      where: eq(userTable.username, username),
    });
  }

  static async findById(id: number) {
    return await db.query.userTable.findFirst({
      where: eq(userTable.id, id),
    });
  }

  static async update(
    id: number,
    payload: UserModel.UpdateProfileDto,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(userTable)
      .set(payload)
      .where(eq(userTable.id, id))
      .returning();

    return result;
  }

  static async findAll() {
    return await db.query.userTable.findMany();
  }
}
