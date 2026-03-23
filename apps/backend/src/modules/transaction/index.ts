import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { TransactionService } from "./transaction.service";
import { SimpleSuccess, Success } from "@/core/response";
import { OpenApiKey } from "../app/openapi";
import {
  BaseModel,
  CursorPaginationSchema,
  SimpleSuccessSchema,
  SuccessSchema,
  TransactionModel,
} from "@z3-wallet/types";

export const transaction = new Elysia()
  .use(authGuard)
  .group("/transactions", (app) => {
    // app.get(
    //   "/",
    //   async ({ user }) => {
    //     const data = await TransactionService.findByUserId(user.id);
    //     return Success(data);
    //   },
    //   {
    //     authenticated: true,
    //     detail: {
    //       summary: "Get all transaction",
    //       tags: [OpenApiKey.Transaction],
    //     },
    //     response: SuccessSchema(
    //       TransactionModel.TransactionWithCategorySchema.array(),
    //     ),
    //   },
    // );
    app.get(
      "/",
      async ({ query, user }) => {
        const data = await TransactionService.cPaginate(query, user.id);
        return Success(data);
      },
      {
        authenticated: true,
        query: TransactionModel.TransactionFilterSchema,
        detail: {
          summary: "Paginate transaction by user",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(
          CursorPaginationSchema(
            TransactionModel.TransactionWithCategorySchema.array(),
            TransactionModel.ExtraDailyTotalSchema.array(),
          ),
        ),
      },
    );
    app.get(
      "/:id",
      async ({ params: { id } }) => {
        const data = await TransactionService.findById(id);
        return Success(data);
      },
      {
        params: BaseModel.NumberIdSchema,
        detail: {
          summary: "Get transaction by ID",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.TransactionSchema),
      },
    );

    app.get(
      "/cashflow",
      async ({ user, query }) => {
        const data = await TransactionService.findCashflowTotalsByUserId(
          query,
          user.id,
        );
        return Success(data);
      },
      {
        authenticated: true,
        query: TransactionModel.TransactionBaseQuerySchema,
        detail: {
          summary: "Get user spending overview",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.UserCashflowSchema),
      },
    );

    app.get(
      "/summary",
      async ({ user }) => {
        const data = await TransactionService.getBalanceSummaryByUserId(
          user.id,
        );
        return Success(data);
      },
      {
        authenticated: true,
        detail: {
          summary: "Get user total transaction summary",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.UserCashflowSummarySchema),
      },
    );

    app.get(
      "/by-category",
      async ({ user, query }) => {
        const data = await TransactionService.getTotalAmountByCategory(
          query,
          user.id,
        );
        return Success(data);
      },
      {
        authenticated: true,
        query: TransactionModel.StatisticFilterSchema,
        detail: {
          summary: "Get user total spending by section by category",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(
          TransactionModel.TotalAmountByCategorySchema.array(),
        ),
      },
    );

    app.get(
      "/statistic",
      async ({ user, query }) => {
        const data = await TransactionService.findStatistic(query, user.id);
        return Success(data);
      },
      {
        authenticated: true,
        query: TransactionModel.StatisticFilterSchema,
        detail: {
          summary: "Get user statistic over specific period",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.StatisticSchema.array()),
      },
    );

    app.post(
      "/",
      async ({ body, user }) => {
        const data = await TransactionService.create(body, user.id);
        return Success(data);
      },
      {
        parse: "application/json",
        body: TransactionModel.CreateTransactionSchema,
        authenticated: true,
        detail: {
          summary: "Create transaction",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.TransactionSchema),
      },
    );
    app.put(
      "/:id",
      async ({ body, user, params: { id } }) => {
        const data = await TransactionService.update(id, user.id, body);
        return Success(data);
      },
      {
        parse: "application/json",
        body: TransactionModel.UpdateTransactionSchema,
        params: BaseModel.NumberIdSchema,
        authenticated: true,
        detail: {
          summary: "Update transaction by ID",
          tags: [OpenApiKey.Transaction],
        },
        response: SuccessSchema(TransactionModel.TransactionSchema),
      },
    );
    app.delete(
      "/:id",
      async ({ user, params: { id } }) => {
        await TransactionService.delete(id, user.id);
        return SimpleSuccess();
      },
      {
        params: BaseModel.NumberIdSchema,
        authenticated: true,
        detail: {
          summary: "Delete transaction by ID",
          tags: [OpenApiKey.Transaction],
        },
        response: SimpleSuccessSchema(),
      },
    );
    return app;
  });
