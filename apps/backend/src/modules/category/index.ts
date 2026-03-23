import Elysia from "elysia";
import { CategoryService } from "./category.service";
import { OpenApiKey } from "../app/openapi";
import { BaseModel, CategoryModel, SuccessSchema } from "@z3-wallet/types";
import { Success } from "@/core/response";

export const category = new Elysia().group("/categories", (app) => {
  app.get(
    "/",
    async () => {
      const data = await CategoryService.findAll();
      return Success(data);
    },
    {
      detail: {
        summary: "Get all categories",
        tags: [OpenApiKey.Category],
      },
      response: SuccessSchema(CategoryModel.CategorySchema.array()),
    },
  );

  app.get(
    "/:id",
    async ({ params: { id } }) => {
      const data = await CategoryService.findById(id);
      return Success(data);
    },
    {
      params: BaseModel.NumberIdSchema,
      detail: {
        summary: "Get category by ID",
        tags: [OpenApiKey.Category],
      },
      response: SuccessSchema(CategoryModel.CategorySchema),
    },
  );

  return app;
});
