import {
  ForbiddenException,
  InvalidCredentialException,
  NotFoundException,
  UnauthorizedException,
} from "@z3-wallet/exception";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/util/password";
import { generateSessionToken, hashSessionToken } from "@/util/session-token";
import { AuthRepository } from "./auth.repository";
import { SessionRepository } from "@/modules/session/session.repository";
import { SimpleSuccess } from "@/core/response";
import { UserRepository } from "@/modules/user/user.repository";
import { AuthModel, UserModel } from "@z3-wallet/types";
import { WalletRepository } from "../wallet/wallet.repository";
import { randomNumber } from "@z3-wallet/utils/number";
import { OAuthRepository } from "./oauth.repository";
import {
  buildGitHubAuthorizeUrl,
  exchangeGitHubAccessToken,
  getGitHubUser,
  getGitHubVerifiedEmail,
} from "./lib/github-oauth";
import env from "@/lib/env";
import {
  buildGoogleAuthorizeUrl,
  exchangeGoogleAccessToken,
  getGoogleUser,
} from "./lib/google-oauth";
import { RedisService } from "@/lib/redis/redis.service";

const DEFAULT_SESSION_EXPIRES_MS = 1000 * 60 * 60 * 24 * 7;

type OAuthCallbackResult =
  | {
      success: true;
      redirect_to: string;
      session: UserModel.UserSessionDto;
    }
  | {
      success: false;
      redirect_to: string;
    };

type OAuthIdentity = {
  provider_account_id: string;
  provider_email: string | null;
  provider_login: string | null;
  provider_name: string | null;
  email_verified: boolean;
};

function safeRedirectTarget(raw: null | string) {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("/auth/")) return null;
  return raw;
}

function authPathBySource(source: AuthModel.OAuthSourceDto) {
  return source === "register" ? "/auth/register" : "/auth/login";
}

function getFrontendBaseUrl() {
  if (env.WEB_APP_URL) return env.WEB_APP_URL;
  return new URL(env.GITHUB_REDIRECT_URI).origin;
}

function buildFrontendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getFrontendBaseUrl()).toString();
}

function buildOAuthErrorRedirect(
  source: AuthModel.OAuthSourceDto,
  error: AuthModel.OAuthErrorDto,
) {
  const path = authPathBySource(source);
  const params = new URLSearchParams();
  params.set("oauth_error", error);
  return buildFrontendUrl(`${path}?${params.toString()}`);
}

function normalizeUsernameSeed(seed: string) {
  const trimmed = seed.trim().replace(/\s+/g, " ");
  if (!trimmed.length) return "user";
  return trimmed;
}

export class AuthService {
  private static async createSessionForUser(
    user: UserModel.UserSessionDto["user"],
  ): Promise<UserModel.UserSessionDto> {
    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(
      Date.now() + DEFAULT_SESSION_EXPIRES_MS,
    ).toISOString();

    await SessionRepository.create({
      user_id: user.id,
      session_token_hash: sessionTokenHash,
      expires_at: expiresAt,
    });

    return {
      session_token: sessionToken,
      expires_at: expiresAt,
      user,
    };
  }

  private static async generateUniqueUsername(seed: string) {
    const base = normalizeUsernameSeed(seed);
    let candidate = base;
    let index = 0;

    while (true) {
      const user = await UserRepository.findByUsername(candidate);
      if (!user) return candidate;
      index += 1;
      candidate = `${base}-${index}`;
    }
  }

  private static getOAuthSuccessRedirect(redirect: null | string) {
    const path = safeRedirectTarget(redirect) ?? "/dashboard";
    return buildFrontendUrl(path);
  }

  private static async resolveOAuthIdentity(
    provider: AuthModel.OAuthProvider,
    code: string,
  ): Promise<OAuthIdentity | null> {
    switch (provider) {
      case AuthModel.OAuthProvider.GITHUB: {
        const accessToken = await exchangeGitHubAccessToken(code);
        if (!accessToken) return null;

        const githubUser = await getGitHubUser(accessToken);
        if (!githubUser) return null;

        const verifiedEmail = await getGitHubVerifiedEmail(accessToken);
        if (!verifiedEmail) {
          return {
            provider_account_id: String(githubUser.id),
            provider_email: null,
            provider_login: githubUser.login,
            provider_name: githubUser.name,
            email_verified: false,
          };
        }

        return {
          provider_account_id: String(githubUser.id),
          provider_email: verifiedEmail,
          provider_login: githubUser.login,
          provider_name: githubUser.name,
          email_verified: true,
        };
      }
      case AuthModel.OAuthProvider.GOOGLE: {
        const accessToken = await exchangeGoogleAccessToken(code);
        if (!accessToken) return null;

        const googleUser = await getGoogleUser(accessToken);
        if (!googleUser) return null;

        return {
          provider_account_id: googleUser.sub,
          provider_email: googleUser.email ?? null,
          provider_login: googleUser.email ?? null,
          provider_name: googleUser.name ?? null,
          email_verified: Boolean(googleUser.email_verified),
        };
      }
      default:
        return null;
    }
  }

  static async signUp(payload: AuthModel.SignUpDto) {
    const isUserExist = await UserRepository.findByEmail(payload.email);
    if (isUserExist)
      throw new ForbiddenException({
        message: "User with the same email already exist",
      });
    return await db.transaction(async (tx) => {
      const user = await UserRepository.create(
        {
          email: payload.email,
          username: payload.username,
          public_id: crypto.randomUUID(),
          avatar_url: randomNumber(1, 9).toString(),
        },
        tx,
      );
      const password_hash = await hashPassword(payload.password);
      await AuthRepository.create(
        {
          password_hash,
          user_id: user.id,
        },
        tx,
      );
      await WalletRepository.create(user.id, { name: "Saving Account" }, tx);
      return SimpleSuccess();
    });
  }

  static async signIn(
    payload: AuthModel.SignInDto,
  ): Promise<UserModel.UserSessionDto> {
    const user = await UserRepository.findByEmail(payload.email);
    if (!user) throw new InvalidCredentialException();
    const auth = await AuthRepository.findByUserId(user.id);
    if (!auth) throw new InvalidCredentialException();
    const isValidPassword = await verifyPassword(
      payload.password,
      auth.password_hash,
    );
    if (!isValidPassword) throw new InvalidCredentialException();
    return this.createSessionForUser(user);
  }

  static async startOAuth(
    payload: AuthModel.OAuthStartQueryDto,
    provider: AuthModel.OAuthProvider,
  ) {
    const state = crypto.randomUUID();
    const redirect = safeRedirectTarget(payload.redirect ?? null);

    await RedisService.setOAuthState(state, {
      provider,
      source: payload.source,
      redirect,
    });
    switch (provider) {
      case AuthModel.OAuthProvider.GITHUB:
        return buildGitHubAuthorizeUrl({ state });
      case AuthModel.OAuthProvider.GOOGLE:
        return buildGoogleAuthorizeUrl({ state });
      default:
        throw new ForbiddenException({ message: "Unsupported provider" });
    }
  }

  static async handleOAuthCallback(
    payload: AuthModel.OAuthCallbackQueryDto,
    provider: AuthModel.OAuthProvider,
  ): Promise<OAuthCallbackResult> {
    if (!payload.state) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect("login", "expired"),
      };
    }

    const oauthState = await RedisService.getOAuthState(payload.state);
    if (!oauthState) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect("login", "expired"),
      };
    }

    await RedisService.deleteOAuthState(payload.state);

    const source = oauthState.source;

    if (oauthState.provider !== provider) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "failed"),
      };
    }

    if (payload.error) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "cancelled"),
      };
    }

    if (!payload.code) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "failed"),
      };
    }

    const identity = await this.resolveOAuthIdentity(provider, payload.code);
    if (!identity) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "failed"),
      };
    }

    if (!identity.provider_email || !identity.email_verified) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "no_verified_email"),
      };
    }

    const linkedAccount = await OAuthRepository.findByProviderAccountId(
      provider,
      identity.provider_account_id,
    );

    if (linkedAccount?.user) {
      return {
        success: true,
        session: await this.createSessionForUser(linkedAccount.user),
        redirect_to: this.getOAuthSuccessRedirect(oauthState.redirect),
      };
    }

    const existingUser = await UserRepository.findByEmail(
      identity.provider_email,
    );
    if (existingUser) {
      const hasLink = await OAuthRepository.findByUserIdAndProvider(
        existingUser.id,
        provider,
      );

      if (!hasLink) {
        await OAuthRepository.create({
          user_id: existingUser.id,
          provider,
          provider_account_id: identity.provider_account_id,
          provider_login: identity.provider_login ?? identity.provider_name,
          provider_email: identity.provider_email,
        });
      }

      return {
        success: true,
        session: await this.createSessionForUser(existingUser),
        redirect_to: this.getOAuthSuccessRedirect(oauthState.redirect),
      };
    }

    const usernameSeed =
      identity.provider_name ??
      identity.provider_login ??
      identity.provider_email.split("@")[0] ??
      "user";
    const username = await this.generateUniqueUsername(usernameSeed);

    const newUser = await db.transaction(async (tx) => {
      const user = await UserRepository.create(
        {
          email: identity.provider_email ?? "",
          username,
          public_id: crypto.randomUUID(),
          avatar_url: randomNumber(1, 9).toString(),
        },
        tx,
      );

      await OAuthRepository.create(
        {
          user_id: user.id,
          provider,
          provider_account_id: identity.provider_account_id,
          provider_login: identity.provider_login ?? identity.provider_name,
          provider_email: identity.provider_email,
        },
        tx,
      );

      await WalletRepository.create(user.id, { name: "Saving Account" }, tx);
      return user;
    });

    return {
      success: true,
      session: await this.createSessionForUser(newUser),
      redirect_to: this.getOAuthSuccessRedirect(oauthState.redirect),
    };
  }

  static async getMe(sessionToken: string): Promise<UserModel.UserSessionDto> {
    const hashedSession = hashSessionToken(sessionToken);
    const session = await SessionRepository.findByToken(hashedSession);
    if (!session) throw new UnauthorizedException();
    const time = new Date(session.expires_at);
    const timeAsNum = time.getTime();
    const updatedExpiresAt = await SessionRepository.updateTime(
      session.id,
      timeAsNum,
    );
    if (!updatedExpiresAt) throw new UnauthorizedException();
    return {
      expires_at: updatedExpiresAt,
      session_token: sessionToken,
      user: session.user,
    };
  }

  static async signOut(sessionToken: string) {
    const hashedSession = hashSessionToken(sessionToken);
    const session = await SessionRepository.findByToken(hashedSession);
    if (!session) throw new UnauthorizedException();
    await RedisService.deleteSession(sessionToken);
    await SessionRepository.deleteSessionById(session.id);
  }

  static async changePassword(
    payload: AuthModel.ChangePasswordDto,
    user: UserModel.UserSessionDto["user"],
  ): Promise<UserModel.UserSessionDto> {
    const auth = await AuthRepository.findByUserId(user.id);
    if (!auth) {
      throw new NotFoundException({
        message: "Authentication record not found",
      });
    }
    const isValid = await verifyPassword(
      payload.current_password,
      auth.password_hash,
    );
    if (!isValid) {
      throw new InvalidCredentialException({
        message: "Current password is incorrect",
      });
    }
    const newPasswordHash = await hashPassword(payload.new_password);
    await AuthRepository.changePassword(newPasswordHash, user.id);
    await SessionRepository.deleteSessionsByUserId(user.id);

    return this.createSessionForUser(user);
  }

  static async findAll() {
    return await UserRepository.findAll();
  }
}
