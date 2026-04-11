import { describe, it, expect } from "bun:test";
import { authHelpers, userHelpers } from "@/test/test-helpers";
import {
  ApiFail,
  DefaultErrorMessage,
  ErrorCode,
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

  describe("GET /users - Restricted Access", () => {
    it("Should return forbidden even for authenticated users", async () => {
      const signInRes = await authHelpers.signIn(
        "test@example.com",
        "Password123!",
      );
      const sessionCookie = authHelpers.extractCookie(signInRes);

      const response = await userHelpers.getUsers(sessionCookie);
      expect(response.status).toBe(ErrorCode.FORBIDDEN);
      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe("User listing is restricted");
    });
  });
});
