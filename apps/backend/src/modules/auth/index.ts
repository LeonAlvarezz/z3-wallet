import Elysia, { redirect } from "elysia";
import {
  AuthModel,
  BaseModel,
  SimpleSuccessSchema,
  SuccessSchema,
  UserModel,
} from "@z3-wallet/types";
import { BadRequestException } from "@z3-wallet/exception";
import { SimpleSuccess, Success } from "@/core/response";
import { authGuard } from "./guard";
import { AuthService } from "./auth.service";
import { OpenApiKey } from "../app/openapi";
import { RedisService } from "@/lib/redis/redis.service";
import { rateLimitGuard } from "@/lib/rate-limit/rate-limit.guard";

export const auth = new Elysia()
  .use(authGuard)
  .use(rateLimitGuard)
  .group("/auth", (app) => {
    app.get(
      "/me",
      async ({ user }) => {
        const data = UserModel.UserPublicSchema.parse(user);
        return Success(data);
      },
      {
        authenticated: true,
        cookie: BaseModel.CookieSchema,
        detail: {
          summary: "Get user info",
          tags: [OpenApiKey.Auth],
        },
        response: SuccessSchema(UserModel.UserPublicSchema),
      },
    );
    app.post(
      "/sign-up",
      async ({ body }) => {
        await AuthService.signUp(body);
        return SimpleSuccess();
      },
      {
        parse: "application/json",
        body: AuthModel.SignUpSchema,
        rateLimit: true,
        detail: {
          summary: "Sign up",
          tags: [OpenApiKey.Auth],
        },
        response: SimpleSuccessSchema,
      },
    );
    app.post(
      "/sign-in",
      async ({ cookie: { session_token }, body }) => {
        const data = await AuthService.signIn(body);
        session_token.value = data.session_token;
        await RedisService.setSession(data.session_token, data.user);
        const publicData = UserModel.UserPublicSessionSchema.parse(data);
        return Success(publicData);
      },
      {
        parse: "application/json",
        body: AuthModel.SignInSchema,
        cookie: BaseModel.CookieSchema,
        // jNo need for rate limit on this one since we already do that on error handler
        // rateLimit: true,
        detail: {
          summary: "Sign in",
          tags: [OpenApiKey.Auth],
        },

        response: SuccessSchema(UserModel.UserPublicSessionSchema),
      },
    );

    app.get(
      "/github/start",
      async ({ query }) => {
        const redirectTo = await AuthService.startOAuth(
          query,
          AuthModel.OAuthProvider.GITHUB,
        );
        return redirect(redirectTo);
      },
      {
        query: AuthModel.OAuthStartQuerySchema,
        detail: {
          summary: "Start GitHub OAuth flow",
          tags: [OpenApiKey.Auth],
        },
      },
    );

    app.get(
      "/github/callback",
      async ({ query, cookie: { session_token } }) => {
        const result = await AuthService.handleOAuthCallback(
          query,
          AuthModel.OAuthProvider.GITHUB,
        );
        if (!result.success) return redirect(result.redirect_to);

        session_token.value = result.session.session_token;
        await RedisService.setSession(
          result.session.session_token,
          result.session.user,
        );
        return redirect(result.redirect_to);
      },
      {
        query: AuthModel.OAuthCallbackQuerySchema,
        cookie: BaseModel.CookieSchema,
        detail: {
          summary: "GitHub OAuth callback",
          tags: [OpenApiKey.Auth],
        },
      },
    );

    app.get(
      "/google/start",
      async ({ query }) => {
        const redirectTo = await AuthService.startOAuth(
          query,
          AuthModel.OAuthProvider.GOOGLE,
        );
        return redirect(redirectTo);
      },
      {
        query: AuthModel.OAuthStartQuerySchema,
        detail: {
          summary: "Start Google OAuth flow",
          tags: [OpenApiKey.Auth],
        },
      },
    );

    app.get(
      "/google/callback",
      async ({ query, cookie: { session_token } }) => {
        const result = await AuthService.handleOAuthCallback(
          query,
          AuthModel.OAuthProvider.GOOGLE,
        );
        if (!result.success) return redirect(result.redirect_to);

        session_token.value = result.session.session_token;
        await RedisService.setSession(
          result.session.session_token,
          result.session.user,
        );
        return redirect(result.redirect_to);
      },
      {
        query: AuthModel.OAuthCallbackQuerySchema,
        cookie: BaseModel.CookieSchema,
        detail: {
          summary: "Google OAuth callback",
          tags: [OpenApiKey.Auth],
        },
      },
    );

    app.post(
      "/sign-out",
      async ({ cookie: { session_token } }) => {
        if (!session_token.value)
          throw new BadRequestException({ message: "Missing Token" });
        await AuthService.signOut(session_token.value);
        delete session_token.value;
        return SimpleSuccess();
      },
      {
        cookie: BaseModel.CookieSchema,
        detail: {
          summary: "Sign out",
          tags: [OpenApiKey.Auth],
        },
        response: SimpleSuccessSchema,
      },
    );

    app.post(
      "/change-password",
      async ({ user, body }) => {
        await AuthService.changePassword(body, user.id);
        return SimpleSuccess();
      },
      {
        body: AuthModel.ChangePasswordSchema,
        authenticated: true,
        cookie: BaseModel.CookieSchema,
        detail: {
          summary: "Change user password",
          tags: [OpenApiKey.Auth],
        },
        response: SimpleSuccessSchema,
      },
    );

    return app;
  });
