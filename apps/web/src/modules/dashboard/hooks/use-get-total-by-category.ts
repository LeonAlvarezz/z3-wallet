import { api } from "@/api";
import { queryKey } from "@/api/keys";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import type { TransactionModel } from "@z3-wallet/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useGetTotalByCategory(
  filter?: TransactionModel.StatisticFilterDto,
) {
  const { data: me } = useGetMe();
  return useQuery({
    queryKey: queryKey.transaction.totalByCategory(me?.public_id, filter),
    queryFn: () => api.transaction.getTotalByCategory(filter),
    placeholderData: keepPreviousData,
    enabled: !!me?.public_id,
  });
}
