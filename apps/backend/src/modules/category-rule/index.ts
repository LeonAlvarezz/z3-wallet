import Elysia from "elysia";
import { auth } from "../auth";
import { CategoryRuleService } from "./category-rule.service";
import {
  BaseModel,
  CategoryRuleModel,
  SimpleSuccessSchema,
  SuccessSchema,
} from "@z3-wallet/types";
import { OpenApiKey } from "../app/openapi";
import { SimpleSuccess, Success } from "@/core/response";

export const categoryRule = new Elysia()
  .use(auth)
  .group("/category-rules", (app) => {
    app.get(
      "/",
      async ({ user }) => {
        const data = await CategoryRuleService.quickFindAllRules(user.id);
        return Success(data);
      },
      {
        authenticated: true,
        detail: {
          summary: "Quick get all user rule group by category",
          tags: [OpenApiKey.CategoryRule],
        },
        response: SuccessSchema(
          CategoryRuleModel.CategoryRuleListSchema.array(),
        ),
      },
    );

    app.get(
      "/category/:id",
      async ({ params: { id }, user }) => {
        const data = await CategoryRuleService.findByCategoryId(id, user.id);
        return Success(data);
      },
      {
        authenticated: true,
        params: BaseModel.NumberIdSchema,
        detail: {
          summary: "Get user category rules by category ID",
          tags: [OpenApiKey.CategoryRule],
        },
        response: SuccessSchema(CategoryRuleModel.CategoryRuleSchema.array()),
      },
    );

    app.get(
      "/count",
      async ({ user }) => {
        const data = await CategoryRuleService.countByCategory(user.id);
        return Success(data);
      },
      {
        authenticated: true,
        detail: {
          summary: "Get user category rule count",
          tags: [OpenApiKey.CategoryRule],
        },
        response: SuccessSchema(
          CategoryRuleModel.CategoryRuleCountSchema.array(),
        ),
      },
    );

    app.post(
      "/",
      async ({ body, user }) => {
        const data = await CategoryRuleService.create(body, user.id);
        return Success(data);
      },
      {
        authenticated: true,
        body: CategoryRuleModel.CreateCategoryRuleSchema,
        detail: {
          summary: "Create user category rule",
          tags: [OpenApiKey.CategoryRule],
        },
        response: SuccessSchema(CategoryRuleModel.CategoryRuleSchema),
      },
    );

    app.put(
      "/:id",
      async ({ params: { id }, body, user }) => {
        const data = await CategoryRuleService.update(id, user.id, body);
        return Success(data);
      },
      {
        authenticated: true,
        params: BaseModel.NumberIdSchema,
        body: CategoryRuleModel.UpdateCategoryRuleSchema,
        detail: {
          summary: "Update user category rule by ID",
          tags: [OpenApiKey.CategoryRule],
        },
      },
    );

    app.delete(
      "/:id",
      async ({ params: { id }, user }) => {
        await CategoryRuleService.delete(id, user.id);
        return SimpleSuccess();
      },
      {
        authenticated: true,
        params: BaseModel.NumberIdSchema,
        detail: {
          summary: "Delete user category rule by ID",
          tags: [OpenApiKey.CategoryRule],
        },
        response: SimpleSuccessSchema(),
      },
    );

    return app;
  });
