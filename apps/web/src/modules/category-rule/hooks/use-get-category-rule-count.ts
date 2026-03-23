import { api } from "@/api";
import { queryKey } from "@/api/keys";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import type { CategoryRuleModel } from "@z3-wallet/types";
import { useQuery } from "@tanstack/react-query";

export function useGetCategoryRuleCount() {
  const { data: me } = useGetMe();

  return useQuery<CategoryRuleModel.CategoryRuleCountDto[]>({
    queryKey: queryKey.categoryRule.count(me?.public_id),
    queryFn: () => api.categoryRule.getCountByCategory(),
    enabled: !!me?.public_id,
    staleTime: 60_000,
  });
}
