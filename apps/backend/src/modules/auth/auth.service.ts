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
import { RedisService } from "@/lib/redis/redis.service";
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

const GITHUB_PROVIDER = "github";
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

function safeRedirectTarget(raw: null | string) {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("/auth/")) return null;
  return raw;
}

function authPathBySource(source: AuthModel.OAuthSourceDto) {
  return source === "register" ? "/auth/register" : "/auth/login";
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

function buildFrontendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!env.WEB_APP_URL) return normalizedPath;
  return new URL(normalizedPath, env.WEB_APP_URL).toString();
}

export class AuthService {
  private static async createSessionForUser(
    user: UserModel.UserSessionDto["user"],
  ): Promise<UserModel.UserSessionDto> {
    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + DEFAULT_SESSION_EXPIRES_MS)
      .toISOString();

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

  static async startGithubOAuth(payload: AuthModel.GitHubStartQueryDto) {
    const state = crypto.randomUUID();
    const redirect = safeRedirectTarget(payload.redirect ?? null);

    await RedisService.setOAuthState(state, {
      source: payload.source,
      redirect,
    });

    return buildGitHubAuthorizeUrl({ state });
  }

  static async handleGithubCallback(
    payload: AuthModel.GitHubCallbackQueryDto,
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

    const accessToken = await exchangeGitHubAccessToken(payload.code);
    if (!accessToken) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "failed"),
      };
    }

    const githubUser = await getGitHubUser(accessToken);
    if (!githubUser) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "failed"),
      };
    }

    const verifiedEmail = await getGitHubVerifiedEmail(accessToken);
    if (!verifiedEmail) {
      return {
        success: false,
        redirect_to: buildOAuthErrorRedirect(source, "no_verified_email"),
      };
    }

    const providerAccountId = String(githubUser.id);
    const linkedAccount = await OAuthRepository.findByProviderAccountId(
      GITHUB_PROVIDER,
      providerAccountId,
    );

    if (linkedAccount?.user) {
      return {
        success: true,
        session: await this.createSessionForUser(linkedAccount.user),
        redirect_to: this.getOAuthSuccessRedirect(oauthState.redirect),
      };
    }

    const existingUser = await UserRepository.findByEmail(verifiedEmail);
    if (existingUser) {
      const hasLink = await OAuthRepository.findByUserIdAndProvider(
        existingUser.id,
        GITHUB_PROVIDER,
      );

      if (!hasLink) {
        await OAuthRepository.create({
          user_id: existingUser.id,
          provider: GITHUB_PROVIDER,
          provider_account_id: providerAccountId,
          provider_login: githubUser.login,
          provider_email: verifiedEmail,
        });
      }

      return {
        success: true,
        session: await this.createSessionForUser(existingUser),
        redirect_to: this.getOAuthSuccessRedirect(oauthState.redirect),
      };
    }

    const usernameSeed = githubUser.name || githubUser.login || "user";
    const username = await this.generateUniqueUsername(usernameSeed);

    const newUser = await db.transaction(async (tx) => {
      const user = await UserRepository.create(
        {
          email: verifiedEmail,
          username,
          public_id: crypto.randomUUID(),
          avatar_url: randomNumber(1, 9).toString(),
        },
        tx,
      );

      await OAuthRepository.create(
        {
          user_id: user.id,
          provider: GITHUB_PROVIDER,
          provider_account_id: providerAccountId,
          provider_login: githubUser.login,
          provider_email: verifiedEmail,
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
    // Session was expired and deleted
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
    console.log("sessionToken:", sessionToken);
    console.log("hashedSession:", hashedSession);
    await RedisService.deleteSession(sessionToken);
    await SessionRepository.deleteSessionById(session.id);
  }

  static async changePassword(
    payload: AuthModel.ChangePasswordDto,
    user_id: number,
  ) {
    const auth = await AuthRepository.findByUserId(user_id);
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
    return AuthRepository.changePassword(newPasswordHash, user_id);
  }

  static async findAll() {
    return await UserRepository.findAll();
  }
}
