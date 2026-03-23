import { requestClient } from "@/lib/request";
import type {
  CursorPagination,
  SimpleSuccess,
  TransactionModel,
} from "@z3-wallet/types";

const key = "/transactions";
const transaction = {
  cPaginate: (filter: TransactionModel.TransactionFilterDto) =>
    requestClient.get<
      CursorPagination<
        TransactionModel.TransactionWithCategoryDto,
        TransactionModel.ExtraDailyTotalDto[]
      >
    >(`${key}`, {
      params: filter,
    }),
  getCashflow: (
    filter?: Pick<TransactionModel.TransactionFilterDto, "time_frame">,
  ) =>
    requestClient.get<TransactionModel.UserCashflowDto>(`${key}/cashflow`, {
      params: filter,
    }),
  getCashflowSummary: () =>
    requestClient.get<TransactionModel.UserCashflowSummaryDto>(
      `${key}/summary`,
    ),
  getById: (id: number) =>
    requestClient.get<TransactionModel.TransactionDto>(`${key}/${id}`),
  create: (payload: TransactionModel.CreateTransactionDto) =>
    requestClient.post<TransactionModel.TransactionDto>(`${key}`, payload),
  update: (id: number, payload: TransactionModel.UpdateTransactionDto) =>
    requestClient.put<TransactionModel.TransactionDto>(`${key}/${id}`, payload),
  delete: (id: number) => requestClient.delete<SimpleSuccess>(`${key}/${id}`),
  getStatistic: (filter?: TransactionModel.StatisticFilterDto) =>
    requestClient.get<TransactionModel.StatisticDto[]>(`${key}/statistic`, {
      params: filter,
    }),
  getTotalByCategory: (filter?: TransactionModel.StatisticFilterDto) =>
    requestClient.get<TransactionModel.TotalAmountByCategoryDto[]>(
      `${key}/by-category`,
      {
        params: filter,
      },
    ),
};
export default transaction;
