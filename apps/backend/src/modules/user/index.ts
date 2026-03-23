import Elysia, { InternalServerError } from "elysia";
import { Success } from "@/core/response";
import { authGuard } from "../auth/guard";
import { OpenApiKey } from "../app/openapi";
import { UserService } from "./user.service";
import { BaseModel, SuccessSchema, UserModel } from "@z3-wallet/types";
import { RedisService } from "@/lib/redis/redis.service";

export const user = new Elysia().use(authGuard).group("/users", (app) => {
  app.put(
    "/me",
    async ({ user, body, cookie: { session_token } }) => {
      const data = await UserService.updateMe(user.id, body);

      if (session_token.value) {
        await RedisService.setSession(session_token.value, data);
      }

      return Success(UserModel.UserPublicSchema.parse(data));
    },
    {
      authenticated: true,
      cookie: BaseModel.CookieSchema,
      body: UserModel.UpdateProfileSchema,
      detail: {
        summary: "Update current user profile",
        tags: [OpenApiKey.User],
      },
      response: SuccessSchema(UserModel.UserPublicSchema),
    },
  );

  app.get(
    "/",
    async () => {
      const data = await UserService.findAll();
      return Success(data);
    },
    {
      protected: true,
      detail: {
        summary: "Get all users list",
        tags: [OpenApiKey.User],
      },
      response: SuccessSchema(UserModel.UserPublicSchema.array()),
    },
  );

  return app;
});
