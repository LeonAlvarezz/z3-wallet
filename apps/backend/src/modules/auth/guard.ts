import { BaseModel } from "@z3-wallet/types";
import Elysia from "elysia";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "@z3-wallet/exception";
import { RedisService } from "@/lib/redis/redis.service";
import { SessionRepository } from "../session/session.repository";
import { hashSessionToken } from "@/util/session-token";

// user middleware (compute user and session and pass to routes)
export const authGuard = new Elysia({ name: "auth-guard" })
  .macro("protected", {
    cookie: BaseModel.CookieSchema,

    async resolve({ cookie }) {
      const sessionToken = cookie.session_token.value;
      if (!sessionToken) throw new UnauthorizedException();
      const hashedSession = hashSessionToken(sessionToken);

      const isValid =
        await SessionRepository.checkIfSessionExist(hashedSession);
      if (!isValid) throw new UnauthorizedException();
    },
  })
  .macro("authenticated", {
    cookie: BaseModel.CookieSchema,
    async resolve({ cookie }) {
      const sessionToken = cookie.session_token.value as string;
      if (!sessionToken) throw new UnauthorizedException();
      const hashedSession = hashSessionToken(sessionToken);
      const isValid =
        await SessionRepository.checkIfSessionExist(hashedSession);
      if (!isValid) throw new UnauthorizedException();

      const userCache = await RedisService.getSession(sessionToken);
      if (userCache) return { user: userCache };

      const user = await AuthService.getMe(sessionToken);
      await RedisService.setSession(user.session_token, user.user);
      return { user: user.user };
    },
  })
  .as("global");
