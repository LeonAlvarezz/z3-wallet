import { UserModel } from "@z3-wallet/types";
import { redis } from "./index";
import {
  REDIS_OAUTH_STATE_EXPERATION,
  REDIS_OAUTH_STATE_KEY,
  REDIS_SESSION_EXPERATION,
  REDIS_SESSION_KEY,
} from "./redis.constant";
import z from "zod";

const OAuthStateSchema = z.object({
  source: z.enum(["login", "register"]),
  redirect: z.string().nullable(),
});

export class RedisService {
  static async setSession(
    session_token: string,
    user: UserModel.UserPublicDto,
    ex?: number,
  ) {
    const key = `${REDIS_SESSION_KEY}:${session_token}`;
    await redis.setex(
      key,
      ex ?? REDIS_SESSION_EXPERATION,
      JSON.stringify(user),
    );
  }
  static async getSession(session_token: string) {
    const key = `${REDIS_SESSION_KEY}:${session_token}`;
    const userStr = await redis.getex(key);
    if (!userStr) {
      return null;
    }
    return UserModel.UserSchema.parse(JSON.parse(userStr));
  }

  static async deleteSession(session_token: string) {
    const key = `${REDIS_SESSION_KEY}:${session_token}`;
    console.log("key:", key);
    await redis.del(key);
  }

  static async setOAuthState(
    state: string,
    payload: z.infer<typeof OAuthStateSchema>,
    ex?: number,
  ) {
    const key = `${REDIS_OAUTH_STATE_KEY}:${state}`;
    await redis.setex(
      key,
      ex ?? REDIS_OAUTH_STATE_EXPERATION,
      JSON.stringify(payload),
    );
  }

  static async getOAuthState(state: string) {
    const key = `${REDIS_OAUTH_STATE_KEY}:${state}`;
    const stateStr = await redis.get(key);
    if (!stateStr) return null;

    const parsed = OAuthStateSchema.safeParse(JSON.parse(stateStr));
    if (!parsed.success) return null;
    return parsed.data;
  }

  static async deleteOAuthState(state: string) {
    const key = `${REDIS_OAUTH_STATE_KEY}:${state}`;
    await redis.del(key);
  }
}
