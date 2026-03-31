import { describe, expect, it } from "bun:test";
import {
  ApiFail,
  ApiSuccess,
  CategoryModel,
  CategoryRuleModel,
  ErrorCode,
  SimpleSuccess,
} from "@z3-wallet/types";
import {
  categoryHelpers,
  categoryRuleHelpers,
  signInDefaultUser,
  signUpAndSignInNewUser,
} from "@/test/test-helpers";

async function getFirstCategoryId() {
  const response = await categoryHelpers.getCategories();
  expect(response.status).toBe(200);

  const data = (await response.json()) as ApiSuccess<
    CategoryModel.CategoryDto[]
  >;
  expect(data.data.length).toBeGreaterThan(0);
  return data.data[0]!.id;
}

function uniqueKeyword(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe("Category Rule Routes", () => {
  describe("Auth Guard", () => {
    it("Should return unauthorized when listing rules without token", async () => {
      const response = await categoryRuleHelpers.getRules("");
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("Should return unauthorized when creating rules without token", async () => {
      const response = await categoryRuleHelpers.createRule("", {
        category_id: 1,
        keyword: "unauthorized-rule",
      });
      expect(response.status).toBe(ErrorCode.UNAUTHORIZED);
    });
  });

  describe("Create/Update/Delete Lifecycle", () => {
    it("Should create, update, and delete a category rule", async () => {
      const sessionCookie = await signInDefaultUser();
      const categoryId = await getFirstCategoryId();

      const createdKeyword = uniqueKeyword("rule-create");
      const createResponse = await categoryRuleHelpers.createRule(
        sessionCookie,
        {
          category_id: categoryId,
          keyword: createdKeyword,
        },
      );

      expect(createResponse.status).toBe(200);
      const created =
        (await createResponse.json()) as ApiSuccess<CategoryRuleModel.CategoryRuleDto>;
      expect(created.data.category_id).toBe(categoryId);
      expect(created.data.keyword).toBe(createdKeyword);

      const updatedKeyword = uniqueKeyword("rule-update");
      const updateResponse = await categoryRuleHelpers.updateRule(
        created.data.id,
        sessionCookie,
        {
          keyword: updatedKeyword,
        },
      );

      expect(updateResponse.status).toBe(200);
      const updated =
        (await updateResponse.json()) as ApiSuccess<CategoryRuleModel.CategoryRuleDto>;
      expect(updated.data.id).toBe(created.data.id);
      expect(updated.data.keyword).toBe(updatedKeyword);

      const byCategoryResponse = await categoryRuleHelpers.getRulesByCategoryId(
        categoryId,
        sessionCookie,
      );
      expect(byCategoryResponse.status).toBe(200);
      const byCategory = (await byCategoryResponse.json()) as ApiSuccess<
        CategoryRuleModel.CategoryRuleDto[]
      >;
      expect(byCategory.data.some((item) => item.id === created.data.id)).toBe(
        true,
      );

      const deleteResponse = await categoryRuleHelpers.deleteRule(
        created.data.id,
        sessionCookie,
      );
      expect(deleteResponse.status).toBe(200);
      const deleted = (await deleteResponse.json()) as SimpleSuccess;
      expect(deleted.success).toBe(true);
    });

    it("Should return not found when creating with invalid category_id", async () => {
      const sessionCookie = await signInDefaultUser();
      const response = await categoryRuleHelpers.createRule(sessionCookie, {
        category_id: 999_999_999,
        keyword: uniqueKeyword("invalid-category"),
      });

      expect(response.status).toBe(ErrorCode.NOT_FOUND);
      const data = (await response.json()) as ApiFail;
      expect(data.error.message).toBe("Category not found");
    });
  });

  describe("Owner Access", () => {
    it("Should prevent updating another user's category rule", async () => {
      const attackerSession = await signInDefaultUser();
      const victimSession = await signUpAndSignInNewUser();
      const categoryId = await getFirstCategoryId();

      const createResponse = await categoryRuleHelpers.createRule(
        victimSession,
        {
          category_id: categoryId,
          keyword: uniqueKeyword("victim-update"),
        },
      );
      expect(createResponse.status).toBe(200);
      const created =
        (await createResponse.json()) as ApiSuccess<CategoryRuleModel.CategoryRuleDto>;

      const updateResponse = await categoryRuleHelpers.updateRule(
        created.data.id,
        attackerSession,
        { keyword: uniqueKeyword("attacker-update") },
      );
      expect(updateResponse.status).toBe(ErrorCode.NOT_FOUND);

      const updateData = (await updateResponse.json()) as ApiFail;
      expect(updateData.error.message).toBe("Category rule not found");
    });

    it("Should prevent deleting another user's category rule", async () => {
      const attackerSession = await signInDefaultUser();
      const victimSession = await signUpAndSignInNewUser();
      const categoryId = await getFirstCategoryId();

      const createResponse = await categoryRuleHelpers.createRule(
        victimSession,
        {
          category_id: categoryId,
          keyword: uniqueKeyword("victim-delete"),
        },
      );
      expect(createResponse.status).toBe(200);
      const created =
        (await createResponse.json()) as ApiSuccess<CategoryRuleModel.CategoryRuleDto>;

      const deleteResponse = await categoryRuleHelpers.deleteRule(
        created.data.id,
        attackerSession,
      );
      expect(deleteResponse.status).toBe(ErrorCode.NOT_FOUND);

      const deleteData = (await deleteResponse.json()) as ApiFail;
      expect(deleteData.error.message).toBe("Category rule not found");
    });
  });

  describe("Read Endpoints Shape", () => {
    it("Should return category rule count with expected shape", async () => {
      const sessionCookie = await signInDefaultUser();
      const response = await categoryRuleHelpers.getRuleCount(sessionCookie);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<
        CategoryRuleModel.CategoryRuleCountDto[]
      >;
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      for (const item of data.data) {
        expect(item.category).toHaveProperty("id");
        expect(item.category).toHaveProperty("name");
        expect(typeof item.total).toBe("number");
      }
    });

    it("Should return quick grouped rule list with expected shape", async () => {
      const sessionCookie = await signInDefaultUser();
      const response = await categoryRuleHelpers.getRules(sessionCookie);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ApiSuccess<
        CategoryRuleModel.CategoryRuleListDto[]
      >;
      expect(Array.isArray(data.data)).toBe(true);

      for (const item of data.data) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(Array.isArray(item.keywords)).toBe(true);
      }
    });
  });
});
