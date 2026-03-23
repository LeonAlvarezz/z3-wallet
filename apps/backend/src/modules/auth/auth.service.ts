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

export class AuthService {
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

    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);

    // Default: 7 days
    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7,
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
