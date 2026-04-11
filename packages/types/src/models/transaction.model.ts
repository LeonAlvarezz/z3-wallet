import z from "zod";
import { BaseModel } from "./base.model";
import { CategoryModel } from "./category.model";
import { CursorModel } from "./cursor.model";

export namespace TransactionModel {
  export enum TransactionTypeEnum {
    TOP_UP = "TOP_UP",
    EXPENSE = "EXPENSE",
  }
  export const TransactionSchema = BaseModel.BaseRowSchema.extend({
    wallet_id: z.coerce.number(),
    amount: z.number(),
    description: z.string().optional().nullable(),
    category_id: z.number().nullable().optional(),
    type: z.enum(TransactionTypeEnum),
  });

  export const TransactionBaseQuerySchema = z.object({
    query: z.string().optional(),
    time_frame: z.enum(BaseModel.TimeFrameEnum).optional(),
  });

  export const TransactionFilterSchema = CursorModel.CursorQuerySchema.extend(
    TransactionBaseQuerySchema.shape,
  );

  export const TransactionWithCategorySchema = TransactionSchema.omit({
    category_id: true,
  }).extend({
    category: z.lazy(() => CategoryModel.CategorySchema).nullable(),
  });
  export const CreateTransactionSchema = TransactionSchema.pick({
    amount: true,
    description: true,
    category_id: true,
    type: true,
  }).extend({
    created_at: z.iso.datetime().optional(),
  });

  export const UpdateTransactionSchema = CreateTransactionSchema.partial();
  export const ExtraDailyTotalSchema = z.object({
    day: z.string(),
    total: z.number(),
  });

  export const UserCashflowSchema = z.object({
    expense: z.number(),
    top_up: z.number(),
  });

  export const UserCashflowSummarySchema = UserCashflowSchema.extend({
    total_remaining_balance: z.number(),
  });

  export const TotalAmountByCategorySchema = z.object({
    amount: z.number(),
    name: z.string().nullable(),
  });

  export const StatisticFilterSchema = z.object({
    time_frame: z.enum(BaseModel.TimeFrameEnum).optional(),
  });

  export const StatisticSchema = z.object({
    date: z.iso.datetime(),
    amount: z.number(),
  });

  export type TransactionDto = z.infer<typeof TransactionSchema>;
  export type TransactionWithCategoryDto = z.infer<
    typeof TransactionWithCategorySchema
  >;
  export type TransactionBaseQuery = z.infer<typeof TransactionBaseQuerySchema>;
  export type TransactionFilterDto = z.infer<typeof TransactionFilterSchema>;
  export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
  export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
  export type ExtraDailyTotalDto = z.infer<typeof ExtraDailyTotalSchema>;
  export type UserCashflowDto = z.infer<typeof UserCashflowSchema>;
  export type UserCashflowSummaryDto = z.infer<
    typeof UserCashflowSummarySchema
  >;
  export type TotalAmountByCategoryDto = z.infer<
    typeof TotalAmountByCategorySchema
  >;
  export type StatisticFilterDto = z.infer<typeof StatisticFilterSchema>;
  export type StatisticDto = z.infer<typeof StatisticSchema>;
}
