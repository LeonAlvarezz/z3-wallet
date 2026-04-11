import { describe, expect, it } from "bun:test";
import { authHelpers } from "@/test/test-helpers";
import {
  ApiFail,
  ApiSuccess,
  DefaultErrorMessage,
  ErrorCode,
  SimpleSuccess,
  UserModel,
} from "@z3-wallet/types";

describe("Auth Route", () => {
  it("Sign in fail with wrong password", async () => {
    const response = await authHelpers.signIn(
      "test@example.com",
      "wrongPassword",
    );
    expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    const data = (await response.json()) as ApiFail;
    expect(data.error.message).toBe(DefaultErrorMessage.INVALID_CREDENTIAL);
  });

  it("Sign in success", async () => {
    const response = await authHelpers.signIn(
      "test@example.com",
      "Password123!",
    );

    expect(response.status).toBe(200);
    const { data } =
      (await response.json()) as ApiSuccess<UserModel.UserPublicSessionDto>;

    expect(data).toHaveProperty("expires_at");
    expect(data).toHaveProperty("user");
    expect(data).not.toHaveProperty("session_token");
  });

  it("Sign in sets a hardened session cookie", async () => {
    const response = await authHelpers.signIn(
      "test@example.com",
      "Password123!",
    );

    expect(response.status).toBe(200);
    const cookieHeader = response.headers.get("set-cookie");
    expect(cookieHeader).toBeTruthy();
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("SameSite=Lax");
    expect(cookieHeader).toContain("Path=/");
  });

  it("Get me success", async () => {
    const signInRes = await authHelpers.signIn(
      "test@example.com",
      "Password123!",
    );
    const sessionCookie = authHelpers.extractCookie(signInRes);

    const response = await authHelpers.getMe(sessionCookie);
    expect(response.status).toBe(200);
    const data =
      (await response.json()) as ApiSuccess<UserModel.UserPublicSessionDto>;
    expect(data.data).toHaveProperty("email");
    expect(data.data).toHaveProperty("public_id");
    expect(data.data).toHaveProperty("username");
  });

  it("Get me fail with invalid token", async () => {
    const response = await authHelpers.getMe("invalid-cookie");
    expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    const data = (await response.json()) as ApiFail;
    expect(data.error.message).toBe(DefaultErrorMessage.UNAUTHORIZED);
  });

  it("Sign out success", async () => {
    const signInRes = await authHelpers.signIn(
      "test@example.com",
      "Password123!",
    );

    const sessionCookie = authHelpers.extractCookie(signInRes);

    const response = await authHelpers.signOut(sessionCookie);
    expect(response.status).toBe(200);
    const data = (await response.json()) as SimpleSuccess;
    expect(data).toHaveProperty("message", "Success");
  });

  it("Change password revokes previous sessions and rotates the current cookie", async () => {
    const nonce = crypto.randomUUID().slice(0, 8);
    const email = `change-password-${nonce}@example.com`;
    const username = `change-password-${nonce}`;
    const currentPassword = "Password123!";
    const newPassword = "Password456!";

    const signUpResponse = await authHelpers.signUp(email, username, currentPassword);
    expect(signUpResponse.status).toBe(200);

    const currentSessionResponse = await authHelpers.signIn(email, currentPassword);
    expect(currentSessionResponse.status).toBe(200);
    const currentSessionCookie = authHelpers.extractCookie(currentSessionResponse);

    const otherSessionResponse = await authHelpers.signIn(email, currentPassword);
    expect(otherSessionResponse.status).toBe(200);
    const otherSessionCookie = authHelpers.extractCookie(otherSessionResponse);

    const changePasswordResponse = await authHelpers.changePassword(
      currentSessionCookie,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
    );

    expect(changePasswordResponse.status).toBe(200);

    const rotatedSessionCookie = authHelpers.extractCookie(changePasswordResponse);
    expect(rotatedSessionCookie).toContain("session_token=");

    const revokedSessionResponse = await authHelpers.getMe(otherSessionCookie);
    expect(revokedSessionResponse.status).toBe(ErrorCode.UNAUTHORIZED);

    const currentUserResponse = await authHelpers.getMe(rotatedSessionCookie);
    expect(currentUserResponse.status).toBe(200);
  });
});
