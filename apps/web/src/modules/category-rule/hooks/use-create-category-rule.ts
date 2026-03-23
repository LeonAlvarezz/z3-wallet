import { api } from "@/api";
import { queryKey } from "@/api/keys";
import type { CategoryRuleModel } from "@z3-wallet/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCategoryRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryRuleModel.CreateCategoryRuleDto) =>
      api.categoryRule.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKey.categoryRule.all,
      });
    },
  });
}
