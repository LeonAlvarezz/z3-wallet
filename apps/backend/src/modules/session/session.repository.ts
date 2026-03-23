import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { authTable, sessionTable } from "@/lib/db/schema";
import {
  SESSION_EXPIRES_DATE_MS,
  SESSION_EXTENDS_EXPIRES_DATE_MS,
} from "@/constant/app";
import { SessionModel } from "@z3-wallet/types";

export class SessionRepository {
  static async create(payload: SessionModel.CreateSessionDto) {
    const [result] = await db.insert(sessionTable).values(payload).returning();
    return result;
  }

  static async checkIfSessionExist(sessionToken: string) {
    const session = await db.query.sessionTable.findFirst({
      where: eq(sessionTable.session_token_hash, sessionToken),
      columns: {
        user_id: true,
        expires_at: true,
      },
    });
    if (!session || new Date(session.expires_at) < new Date()) return null;
    return session;
  }
  static async findByToken(sessionToken: string) {
    return await db.query.sessionTable.findFirst({
      where: eq(sessionTable.session_token_hash, sessionToken),
      with: {
        user: true,
      },
    });
  }

  static async deleteSessionById(sessionId: number) {
    return await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
  }

  static async updateSessionExpiredAt(sessionId: number, expiredAt: string) {
    return await db
      .update(sessionTable)
      .set({
        expires_at: expiredAt,
      })
      .where(eq(sessionTable.id, sessionId));
  }

  static async updateTime(id: number, time: number): Promise<string | null> {
    // If expired, delete session and return null
    if (Date.now() >= time) {
      await SessionRepository.deleteSessionById(id);
      return null;
    }

    //If token expires tomorrow, then extends 15 days
    if (Date.now() >= time - SESSION_EXTENDS_EXPIRES_DATE_MS) {
      const extendedTime = new Date(
        Date.now() + SESSION_EXPIRES_DATE_MS,
      ).toISOString();
      await this.updateSessionExpiredAt(id, extendedTime);
      return extendedTime;
    }

    return new Date(time).toISOString();
  }
}
