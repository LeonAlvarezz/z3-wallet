import { DrizzleTransaction, db } from "@/lib/db";
import { oauthTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export class OAuthRepository {
  static async create(
    payload: {
      user_id: number;
      provider: string;
      provider_account_id: string;
      provider_login?: string | null;
      provider_email?: string | null;
    },
    tx?: DrizzleTransaction,
  ) {
    const client = tx ?? db;
    const [result] = await client.insert(oauthTable).values(payload).returning();
    return result;
  }

  static async findByProviderAccountId(provider: string, providerAccountId: string) {
    return await db.query.oauthTable.findFirst({
      where: and(
        eq(oauthTable.provider, provider),
        eq(oauthTable.provider_account_id, providerAccountId),
      ),
      with: {
        user: true,
      },
    });
  }

  static async findByUserIdAndProvider(userId: number, provider: string) {
    return await db.query.oauthTable.findFirst({
      where: and(eq(oauthTable.user_id, userId), eq(oauthTable.provider, provider)),
    });
  }

  static async findProvidersByUserId(userId: number) {
    return await db.query.oauthTable.findMany({
      where: eq(oauthTable.user_id, userId),
      columns: {
        provider: true,
      },
    });
  }
}
