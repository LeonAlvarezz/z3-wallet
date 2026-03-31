import { describe, expect, it } from "bun:test";
import {
  ApiFail,
  ApiSuccess,
  CategoryModel,
  CursorModel,
  ErrorCode,
  TransactionModel,
} from "@z3-wallet/types";
import {
  authHelpers,
  categoryHelpers,
  signInDefaultUser,
  signUpAndSignInNewUser,
  transactionHelpers,
} from "@/test/test-helpers";

type PaginatedTransactions = {
  data: TransactionModel.TransactionWithCategoryDto[];
  meta: CursorModel.CursorMeta;
  extra?: TransactionModel.ExtraDailyTotalDto[];
};

async function getFirstCategoryId() {
  const response = await categoryHelpers.getCategories();
  expect(response.status).toBe(200);

  const data = (await response.json()) as ApiSuccess<
    CategoryModel.CategoryDto[]
  >;
  expect(data.data.length).toBeGreaterThan(0);

  return data.data[0]!.id;
}

describe("Transaction Routes", () => {
  describe("Auth Guard", () => {
    it("Should return unauthorized when listing transactions without token", async () => {
      const response = await transactionHelpers.getTransactions("");
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("Should return unauthorized when creating transactions without token", async () => {
      const response = await transactionHelpers.createTransaction("", {
        amount: 12,
        description: "Unauthorized create",
        type: TransactionModel.TransactionTypeEnum.TOP_UP,
      });
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe("Create Transaction", () => {
    it("Should create expense transaction with category", async () => {
      const sessionCookie = await signInDefaultUser();
      const categoryId = await getFirstCategoryId();

      const response = await transactionHelpers.createTransaction(
        sessionCookie,
        {
          amount: 25.5,
          description: "Integration expense",
          type: TransactionModel.TransactionTypeEnum.EXPENSE,
          category_id: categoryId,
        },
      );

      expect(response.status).toBe(200);

      const data =
        (await response.json()) as ApiSuccess<TransactionModel.TransactionDto>;
      expect(data.success).toBe(true);
      expect(data.data.type).toBe(TransactionModel.TransactionTypeEnum.EXPENSE);
      expect(data.data.category_id).toBe(categoryId);
      expect(data.data.amount).toBe(25.5);
    });

    it("Should create top-up transaction without category", async () => {
      const sessionCookie = await signInDefaultUser();

      const response = await transactionHelpers.createTransaction(
        sessionCookie,
        {
          amount: 100,
          description: "Integration top-up",
          type: TransactionModel.TransactionTypeEnum.TOP_UP,
        },
      );

      expect(response.status).toBe(200);

      const data =
        (await response.json()) as ApiSuccess<TransactionModel.TransactionDto>;
      expect(data.success).toBe(true);
      expect(data.data.type).toBe(TransactionModel.TransactionTypeEnum.TOP_UP);
      expect(data.data.category_id).toBeNull();
      expect(data.data.amount).toBe(100);
    });

    it("Should reject expense transaction when category_id is missing", async () => {
      const sessionCookie = await signInDefaultUser();

      const response = await transactionHelpers.createTransaction(
        sessionCookie,
        {
          amount: 20,
          description: "Missing category",
          type: TransactionModel.TransactionTypeEnum.EXPENSE,
        },
      );

      expect(response.status).toBe(ErrorCode.BAD_REQUEST);
      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe("Invalid category_id");
    });

    it("Should reject expense transaction with invalid category_id", async () => {
      const sessionCookie = await signInDefaultUser();

      const response = await transactionHelpers.createTransaction(
        sessionCookie,
        {
          amount: 20,
          description: "Invalid category",
          type: TransactionModel.TransactionTypeEnum.EXPENSE,
          category_id: 999_999_999,
        },
      );

      expect(response.status).toBe(ErrorCode.BAD_REQUEST);
      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe("Invalid category_id");
    });
  });

  describe("Permission", () => {
    it("Should return forbidden when updating another user's transaction", async () => {
      const attackerSession = await signInDefaultUser();
      const victimSession = await signUpAndSignInNewUser();
      const categoryId = await getFirstCategoryId();

      const created = await transactionHelpers.createTransaction(
        victimSession,
        {
          amount: 33,
          description: "Victim transaction for update",
          type: TransactionModel.TransactionTypeEnum.EXPENSE,
          category_id: categoryId,
        },
      );
      expect(created.status).toBe(200);
      const createdData =
        (await created.json()) as ApiSuccess<TransactionModel.TransactionDto>;

      const response = await transactionHelpers.updateTransaction(
        createdData.data.id,
        attackerSession,
        { amount: 99 },
      );

      expect(response.status).toBe(ErrorCode.FORBIDDEN);
      const data = (await response.json()) as ApiFail;
      expect(data.error.status).toBe(ErrorCode.FORBIDDEN);
    });

    it("Should return forbidden when deleting another user's transaction", async () => {
      const attackerSession = await signInDefaultUser();
      const victimSession = await signUpAndSignInNewUser();
      const categoryId = await getFirstCategoryId();

      const created = await transactionHelpers.createTransaction(
        victimSession,
        {
          amount: 44,
          description: "Victim transaction for delete",
          type: TransactionModel.TransactionTypeEnum.EXPENSE,
          category_id: categoryId,
        },
      );
      expect(created.status).toBe(200);
      const createdData =
        (await created.json()) as ApiSuccess<TransactionModel.TransactionDto>;

      const response = await transactionHelpers.deleteTransaction(
        createdData.data.id,
        attackerSession,
      );

      expect(response.status).toBe(ErrorCode.FORBIDDEN);
      const data = (await response.json()) as ApiFail;
      expect(data.error.status).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe("Cursor Pagination", () => {
    it("Should not return duplicate transaction IDs across pages", async () => {
      const sessionCookie = await signInDefaultUser();
      const searchTag = `cursor-tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      for (let index = 0; index < 6; index += 1) {
        const createResponse = await transactionHelpers.createTransaction(
          sessionCookie,
          {
            amount: 10 + index,
            description: `${searchTag}-item-${index}`,
            type: TransactionModel.TransactionTypeEnum.TOP_UP,
          },
        );
        expect(createResponse.status).toBe(200);
      }

      const firstPageResponse = await transactionHelpers.getTransactions(
        sessionCookie,
        {
          page_size: 3,
          query: searchTag,
        },
      );
      expect(firstPageResponse.status).toBe(200);

      const firstPage =
        (await firstPageResponse.json()) as ApiSuccess<PaginatedTransactions>;
      expect(firstPage.data.data.length).toBe(3);
      expect(firstPage.data.meta.next_cursor).toBeTruthy();

      const secondPageResponse = await transactionHelpers.getTransactions(
        sessionCookie,
        {
          page_size: 3,
          query: searchTag,
          cursor: firstPage.data.meta.next_cursor,
        },
      );
      expect(secondPageResponse.status).toBe(200);
      const secondPage =
        (await secondPageResponse.json()) as ApiSuccess<PaginatedTransactions>;
      expect(secondPage.data.data.length).toBe(3);

      const firstIds = new Set(firstPage.data.data.map((item) => item.id));
      for (const transaction of secondPage.data.data) {
        expect(firstIds.has(transaction.id)).toBe(false);
      }
    });
  });
});
