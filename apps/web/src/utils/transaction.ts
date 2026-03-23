import type { TransactionModel, WalletEventModel } from "@z3-wallet/types";
import { formatDate, getDateLabel } from "./date";
export type DailyGroupData = {
  day: string; // YYYY-MM-DD (matches backend `extra[].day`)
  date: string;
  label: string;
  total: number;
  transactions: TransactionModel.TransactionWithCategoryDto[];
};

export type GroupedTopUpHistory = {
  day: string;
  date: string;
  label: string;
  total: number;
  items: WalletEventModel.WalletEventPublic[];
};

export const groupTransactionsByDate = (
  transactions: TransactionModel.TransactionWithCategoryDto[],
  extra?: TransactionModel.ExtraDailyTotalDto[],
): DailyGroupData[] => {
  const grouped: Record<string, TransactionModel.TransactionWithCategoryDto[]> =
    {};
  for (const transaction of transactions) {
    const day = transaction.created_at.split("T")[0];
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(transaction);
  }

  return Object.entries(grouped)
    .map(([day, txns]) => {
      const localIsoDate = `${day}T00:00:00`;
      return {
        day,
        date: formatDate(localIsoDate),
        label: getDateLabel(localIsoDate),
        total:
          extra?.find((data) => data.day === day)?.total ||
          txns.reduce((sum, item) => sum + item.amount, 0) ||
          0,
        transactions: txns.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      };
    })
    .sort((a, b) => b.day.localeCompare(a.day));
};

export const groupTopUpHistoryByDate = (
  items: WalletEventModel.WalletEventPublic[],
): GroupedTopUpHistory[] => {
  const grouped: Record<string, WalletEventModel.WalletEventPublic[]> = {};

  for (const item of items) {
    const day = item.created_at.split("T")[0];
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(item);
  }

  return Object.entries(grouped)
    .map(([day, groupedItems]) => {
      const localIsoDate = `${day}T00:00:00`;
      return {
        day,
        date: formatDate(localIsoDate),
        label: getDateLabel(localIsoDate),
        total: groupedItems.reduce((sum, item) => sum + item.amount, 0),
        items: groupedItems.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      };
    })
    .sort((a, b) => b.day.localeCompare(a.day));
};

