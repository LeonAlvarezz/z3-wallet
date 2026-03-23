import { api } from "@/api";
import { queryKey } from "@/api/keys";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import type { TransactionModel } from "@z3-wallet/types";
import { useQuery } from "@tanstack/react-query";

export function useGetStatistic(filter?: TransactionModel.StatisticFilterDto) {
  const { data: me } = useGetMe();
  return useQuery({
    queryKey: queryKey.transaction.statistic(me?.public_id, filter),
    queryFn: () => api.transaction.getStatistic(filter),
    enabled: !!me?.public_id,
  });
}
