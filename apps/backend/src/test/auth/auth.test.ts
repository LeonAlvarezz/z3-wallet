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
    expect(data).toHaveProperty("session_token");
    expect(data).toHaveProperty("expires_at");
    expect(data).toHaveProperty("user");
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
});
