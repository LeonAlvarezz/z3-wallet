import { queryKey } from "@/api/keys";
import { api } from "@/api";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import { useQuery } from "@tanstack/react-query";
import type { TransactionModel } from "@z3-wallet/types";

export function useCashflowOverview(
  filter?: TransactionModel.TransactionBaseQuery,
) {
  const me = useGetMe();

  return useQuery({
    queryKey: queryKey.transaction.cashflow(me.data?.public_id, filter),
    enabled: !!me.data?.public_id,
    queryFn: () => api.transaction.getCashflow(filter),
  });
}
