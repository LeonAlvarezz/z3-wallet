import { describe, expect, it } from "bun:test";
import {
  ApiFail,
  ApiSuccess,
  CategoryModel,
  DefaultErrorMessage,
  ErrorCode,
  WalletModel,
} from "@z3-wallet/types";
import { authHelpers, categoryHelpers, walletHelpers } from "@/test/test-helpers";

const DEFAULT_TEST_USER = {
  email: "test@example.com",
  password: "Password123!",
};

async function signInDefaultUser() {
  const response = await authHelpers.signIn(
    DEFAULT_TEST_USER.email,
    DEFAULT_TEST_USER.password,
  );
  expect(response.status).toBe(200);
  return authHelpers.extractCookie(response);
}

describe("Wallet and Category Read Routes", () => {
  describe("Wallet Routes", () => {
    it("Should return unauthorized when getting wallet without token", async () => {
      const response = await walletHelpers.getWallet("");
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("Should return unauthorized when getting account balance without token", async () => {
      const response = await walletHelpers.getAccountBalance("");
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("Should return wallet with expected schema when authenticated", async () => {
      const sessionCookie = await signInDefaultUser();
      const response = await walletHelpers.getWallet(sessionCookie);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<WalletModel.WalletPublicDto>;
      expect(data.data).toHaveProperty("public_id");
      expect(data.data).toHaveProperty("user_id");
      expect(data.data).toHaveProperty("name");
      expect(data.data).toHaveProperty("created_at");
    });

    it("Should return account balance with expected schema when authenticated", async () => {
      const sessionCookie = await signInDefaultUser();
      const response = await walletHelpers.getAccountBalance(sessionCookie);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<WalletModel.AccountBalanceDto>;
      expect(typeof data.data.balance).toBe("number");
      expect(typeof data.data.expenses).toBe("number");
      expect(typeof data.data.remaining).toBe("number");
    });
  });

  describe("Category Routes", () => {
    it("Should return category list without authentication", async () => {
      const response = await categoryHelpers.getCategories();
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<CategoryModel.CategoryDto[]>;
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      for (const category of data.data) {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("color");
        expect(category).toHaveProperty("order");
      }
    });

    it("Should return category by id with expected schema", async () => {
      const listResponse = await categoryHelpers.getCategories();
      expect(listResponse.status).toBe(200);
      const listData = (await listResponse.json()) as ApiSuccess<
        CategoryModel.CategoryDto[]
      >;
      const firstCategoryId = listData.data[0]!.id;

      const response = await categoryHelpers.getCategoryById(firstCategoryId);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<CategoryModel.CategoryDto>;
      expect(data.data.id).toBe(firstCategoryId);
      expect(data.data).toHaveProperty("name");
      expect(data.data).toHaveProperty("icon");
      expect(data.data).toHaveProperty("color");
    });

    it("Should return not found for unknown category id", async () => {
      const response = await categoryHelpers.getCategoryById(999_999_999);
      expect(response.status).toBe(ErrorCode.NOT_FOUND);

      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe(DefaultErrorMessage.NOT_FOUND);
    });
  });
});
