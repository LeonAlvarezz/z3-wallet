import { describe, it, expect } from "bun:test";
import { authHelpers, userHelpers } from "@/test/test-helpers";
import {
  ApiFail,
  ApiSuccess,
  DefaultErrorMessage,
  UserModel,
} from "@z3-wallet/types";
describe("User Routes", () => {
  describe("GET /users - Error Cases", () => {
    it("Should return unauthorized when no auth token is provided", async () => {
      const response = await userHelpers.getUsers("");
      expect(response.status).toBe(401);
    });

    it("Should return unauthorized with invalid token", async () => {
      const response = await userHelpers.getUsers("session_token=invalid");
      expect(response.status).toBe(401);
      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe(DefaultErrorMessage.UNAUTHORIZED);
      expect(data.error.status).toBe(401);
    });
  });

  describe("GET /users - Success Cases", () => {
    it("Should return list of users when authenticated", async () => {
      const signInRes = await authHelpers.signIn(
        "test@example.com",
        "Password123!",
      );
      const sessionCookie = authHelpers.extractCookie(signInRes);

      const response = await userHelpers.getUsers(sessionCookie);
      expect(response.status).toBe(200);
      const data = (await response.json()) as ApiSuccess<
        UserModel.UserPublicDto[]
      >;
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("Should return users with correct schema", async () => {
      const signInRes = await authHelpers.signIn(
        "test@example.com",
        "Password123!",
      );
      const sessionCookie = authHelpers.extractCookie(signInRes);

      const response = await userHelpers.getUsers(sessionCookie);
      if (response.status === 200) {
        const data = (await response.json()) as ApiSuccess<
          UserModel.UserPublicDto[]
        >;
        data.data.forEach((user: UserModel.UserPublicDto) => {
          expect(user).toHaveProperty("email");
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("public_id");
        });
      }
    });
  });
});
